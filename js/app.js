// == DOM Elements ==
const kanbanView = document.getElementById("kanbanView");
const formView = document.getElementById("formView");
const orderForm = document.getElementById("orderForm");
const orderDetailModal = document.getElementById("orderDetailModal");
const orderDetailContent = document.getElementById("orderDetailContent");
const editOrderBtn = document.getElementById("editOrderBtn");
const closeDetail = document.getElementById("closeDetail");

const menuToggle = document.getElementById("menuToggle");
const sideMenu = document.getElementById("sideMenu");

menuToggle.addEventListener("click", () => {
  sideMenu.classList.toggle("hidden");
});


// == Constants ==
const statuses = [
  "Order Placed",
  "Design",
  "Waiting for Approval",
  "Approved",
  "Printing",
  "Ready for Pickup",
  "Completed"
];

// == Helpers ==
function hideMenu() {
  document.getElementById("sideMenu").classList.add("hidden");
}
function generateId() {
  return Math.floor(10000 + Math.random() * 90000);
}

function calculateBalance(totalPrice, downPayment) {
  return parseFloat(totalPrice || 0) - parseFloat(downPayment || 0);
}

function renderOrderDetails(order) {
  const balance = calculateBalance(order.totalPrice, order.downPayment);
  return `
    <h3>Order #${order.id}</h3>
    <p><strong>Customer:</strong> ${order.customerName}</p>
    <p><strong>Phone:</strong> ${order.phone}</p>
    <p><strong>Email:</strong> ${order.email}</p>
    <p><strong>Address:</strong> ${order.address}</p>
    <p><strong>Type:</strong> ${order.orderType}</p>
    <p><strong>Description:</strong> ${order.description}</p>
    <p><strong>Down Payment:</strong> $${parseFloat(order.downPayment || 0).toFixed(2)}</p>
    <p><strong>Total Price:</strong> $${parseFloat(order.totalPrice || 0).toFixed(2)}</p>
    <p><strong>Balance Due:</strong> $${balance.toFixed(2)}</p>
    <p><strong>Order Date:</strong> ${order.orderDate}</p>
    <p><strong>Design Date:</strong> ${order.designDate}</p>
    <p><strong>Notes:</strong> ${order.notes}</p>
    <p><strong>Status:</strong> ${order.status}</p>
  `;
}

function showKanban() {
  kanbanView.style.display = "flex";
  formView.style.display = "none";
  trashView.classList.add("hidden");
}

function showForm() {
  kanbanView.style.display = "none";
  formView.style.display = "block";
  trashView.classList.add("hidden");
}
function showUndoBanner(orderId) {
  const banner = document.getElementById("undoBanner");
  const undoBtn = document.getElementById("undoButton");

  banner.classList.remove("hidden");

  const timeout = setTimeout(() => {
    banner.classList.add("hidden");
  }, 5000);

  undoBtn.onclick = () => {
    clearTimeout(timeout);
    const order = OrderManager.orders.find(o => o.id === orderId);
    if (!order) return;
    delete order.deletedAt;
    delete order.syncStatus;
    OrderManager.save();
    OrderManager.renderKanban();
    banner.classList.add("hidden");
  };
}

// == Order Manager ==
const OrderManager = {
  orders: JSON.parse(localStorage.getItem("orders")) || [],

  save() {
    localStorage.setItem("orders", JSON.stringify(this.orders));
  },

  getById(id) {
    return this.orders.find(o => o.id == id);
  },

  add(order) {
    this.orders.push(order);
    this.save();
  },

  update(id, updatedOrder) {
    const index = this.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      this.orders[index] = updatedOrder;
      this.save();
    }
  },

  renderTrash() {
    const trashBoard = document.getElementById("trashBoard");
    trashBoard.innerHTML = "";
  
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
  
    const trashedOrders = this.orders.filter(order => {
      if (!order.deletedAt) return false;
  
      const timeSinceDelete = now - order.deletedAt;
      return timeSinceDelete <= oneDay; // only show if within 1 day
    });
  
    trashedOrders.forEach(order => {
      const card = document.createElement("div");
      card.className = "order-card deleted";
      card.innerHTML = `
        <strong>${order.id}</strong><br>
        ${order.customerName}<br>
        ${order.orderType}<br>
        <span class="sync-label">🗑️ Deleted</span>
      `;
      card.setAttribute("data-id", order.id);
      card.addEventListener("click", handleCardClick);
      trashBoard.appendChild(card);
    });
  
    if (trashedOrders.length === 0) {
      trashBoard.innerHTML = "<p>No recently deleted orders.</p>";
    }
  },

  cleanupOldDeleted() {
    const oneDay = 24 * 60 * 60 * 1000;
    const now = Date.now();
  
    this.orders = this.orders.filter(order => {
      if (!order.deletedAt) return true;
      return now - order.deletedAt <= oneDay;
    });
  
    this.save();
  },

  renderKanban() {
    const board = document.getElementById("kanbanBoard");
    board.innerHTML = "";
  
    statuses.forEach(status => {
      const column = document.createElement("div");
      column.className = "kanban-column";
      const statusClass = status.toLowerCase().replace(/\s+/g, "-");
      column.classList.add(statusClass);
  
      column.innerHTML = `<div class="kanban-header"><h3>${status}</h3></div>`;
  
      const filteredOrders = this.orders.filter(o => {
        // Must match this column's status
        if (o.status !== status) return false;
      
        // If soft-deleted, check how long ago
        if (o.deletedAt) {
          const oneDay = 24 * 60 * 60 * 1000;
          const timeSinceDelete = Date.now() - o.deletedAt;
      
          // If deleted more than 1 day ago, hide it
          if (timeSinceDelete > oneDay) return false;
        }
      
        return true;
      });
      filteredOrders.forEach(order => {
        const card = document.createElement("div");
        card.className = "order-card";
  
        // 🔴 Add this: flag deleted cards
        if (order.deletedAt) {
          card.classList.add("deleted");
          card.innerHTML = `<strong>${order.id}</strong><br>${order.customerName}<br>${order.orderType}<br><span class="sync-label">🗑️ Sync: Deleted</span>`;
        } else {
          card.innerHTML = `<strong>${order.id}</strong><br>${order.customerName}<br>${order.orderType}`;
        }
  
        card.setAttribute("data-id", order.id);
        card.addEventListener("click", handleCardClick);
        column.appendChild(card);
      });
  
      board.appendChild(column);
    });
  }
  
};

let editOrderId = null;

function handleCardClick(e) {
  const id = e.currentTarget.getAttribute("data-id");
  const order = OrderManager.getById(id);
  if (!order) return;

  orderDetailContent.innerHTML = renderOrderDetails(order);
  editOrderId = order.id;
  orderDetailModal.style.display = "flex";

  // 🔄 Change delete button text to "Recover" if already deleted
  if (order.deletedAt) {
    deleteOrderBtn.textContent = "Recover";
  } else {
    deleteOrderBtn.textContent = "Delete";
  }
}


function handleFormSubmit(e) {
  e.preventDefault();
  const formData = new FormData(orderForm);

  const newOrder = {
    id: editOrderId || generateId(),
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    orderType: formData.get("orderType"),
    description: formData.get("description"),
    downPayment: parseFloat(formData.get("downPayment") || 0),
    totalPrice: parseFloat(formData.get("totalPrice") || 0),
    orderDate: formData.get("orderDate"),
    designDate: formData.get("designDate"),
    notes: formData.get("notes"),
    images: formData.getAll("images"),
    status: "Order Placed"
  };

  if (editOrderId) {
    OrderManager.update(editOrderId, newOrder);
  } else {
    OrderManager.add(newOrder);
  }

  OrderManager.renderKanban();
  showKanban();
  orderForm.reset();
  editOrderId = null;
  alert(editOrderId ? "Order updated!" : "New order saved!");
}

  // Trash toggle
  function toggleTrash() {
    kanbanView.style.display = "none";
    formView.style.display = "none";
    trashView.classList.toggle("hidden");
    OrderManager.renderTrash();
    hideMenu();
  }
  
// == Event Listeners ==
document.addEventListener("DOMContentLoaded", () => {
  // Auto-cleanup deleted orders
  OrderManager.cleanupOldDeleted();

  // Initial render
  OrderManager.renderKanban();

  // Form submission
  orderForm.addEventListener("submit", handleFormSubmit);

  // Modal close
  closeDetail.addEventListener("click", () => {
    orderDetailModal.style.display = "none";
  });  

  // Delete or recover
  deleteOrderBtn.addEventListener("click", () => {
    if (!editOrderId) return;

    const order = OrderManager.orders.find(o => o.id === editOrderId);
    if (!order) return;

    if (order.deletedAt) {
      delete order.deletedAt;
      delete order.syncStatus;
    } else {
      order.deletedAt = Date.now();
      order.syncStatus = 'deleted';
      showUndoBanner(editOrderId);
    }

    OrderManager.save();
    OrderManager.renderKanban();
    orderDetailModal.style.display = "none";
    editOrderId = null;
  });

  // Edit button
  editOrderBtn.addEventListener("click", () => {
    if (!editOrderId) return;
    const order = OrderManager.getById(editOrderId);
    if (!order) return;

    // Fill form
    orderForm.customerName.value = order.customerName;
    orderForm.phone.value = order.phone;
    orderForm.email.value = order.email;
    orderForm.address.value = order.address;
    orderForm.orderType.value = order.orderType;
    orderForm.description.value = order.description;
    orderForm.downPayment.value = order.downPayment;
    orderForm.totalPrice.value = order.totalPrice;
    orderForm.orderDate.value = order.orderDate;
    orderForm.designDate.value = order.designDate;
    orderForm.notes.value = order.notes;

    window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("formTitle").textContent = "Edit Order";
    orderDetailModal.style.display = "none";
    showForm();
  });
});
