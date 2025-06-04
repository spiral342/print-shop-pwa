// == DOM Elements ==
const kanbanView = document.getElementById("kanbanView");
const formView = document.getElementById("formView");
const orderForm = document.getElementById("orderForm");
const orderDetailModal = document.getElementById("orderDetailModal");
const orderDetailContent = document.getElementById("orderDetailContent");
const editOrderBtn = document.getElementById("editOrderBtn");
const closeDetail = document.getElementById("closeDetail");

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
}

function showForm() {
  formView.style.display = "block";
  kanbanView.style.display = "none";
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

  renderKanban() {
    const board = document.getElementById("kanbanBoard");
    board.innerHTML = "";

    statuses.forEach(status => {
      const column = document.createElement("div");
      column.className = "kanban-column";
      const statusClass = status.toLowerCase().replace(/\s+/g, "-");
      column.classList.add(statusClass);

      column.innerHTML = `<div class="kanban-header"><h3>${status}</h3></div>`;

      const filteredOrders = this.orders.filter(o => o.status === status);
      filteredOrders.forEach(order => {
        const card = document.createElement("div");
        card.className = "order-card";
        card.innerHTML = `<strong>${order.id}</strong><br>${order.customerName}<br>${order.orderType}`;
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

// == Event Listeners ==
document.addEventListener("DOMContentLoaded", () => {
  OrderManager.renderKanban();
  orderForm.addEventListener("submit", handleFormSubmit);

  closeDetail.addEventListener("click", () => {
    orderDetailModal.style.display = "none";
  });
  deleteOrderBtn.addEventListener("click", () => {
    if (!editOrderId) return;
    const confirmDelete = confirm("Are you sure you want to delete this order?");
    if (!confirmDelete) return;

    OrderManager.orders = OrderManager.orders.filter(o => o.id !== editOrderId);
    OrderManager.save();
    OrderManager.renderKanban();

    orderDetailModal.style.display = "none";
    editOrderId = null;
  });
  editOrderBtn.addEventListener("click", () => {
    if (!editOrderId) return;
  
    const order = OrderManager.getById(editOrderId);
    if (!order) return;
  
    // Fill the form with order data
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
  
    // Update the form title
    document.getElementById("formTitle").textContent = "Edit Order";
  
    // Hide modal and show form
    orderDetailModal.style.display = "none";
    showForm();
  });  
});