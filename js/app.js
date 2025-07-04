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

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (sec < 60) return "Just now";
  if (min < 60) return `${min} min${min === 1 ? "" : "s"} ago`;
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  return `${day} day${day === 1 ? "" : "s"} ago`;
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

  recoverOrder(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;
  
    delete order.deletedAt;
    delete order.syncStatus;
  
    this.save();
    this.renderKanban();
    this.renderTrash();
  
    // Optional: Close detail modal if it’s open and recovering from there
    orderDetailModal.style.display = "none";
    editOrderId = null;
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
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  
    const trashedOrders = this.orders.filter(order => {
      if (!order.deletedAt) return false;
      const timeSinceDelete = now - order.deletedAt;
      return timeSinceDelete <= thirtyDays;
    });
  
    trashedOrders.forEach(order => {
      const card = document.createElement("div");
      card.className = "order-card deleted";
      card.innerHTML = `
        <strong>${order.id}</strong><br>
        ${order.customerName}<br>
        ${order.orderType}<br>
        <span class="sync-label">🗑️ Deleted</span><br>
        <button class="recover-btn">Recover</button>
      `;
      card.setAttribute("data-id", order.id);
  
      // Open expanded card on card click
      card.addEventListener("click", handleCardClick);
  
      // Prevent Recover button from opening modal
      const recoverBtn = card.querySelector(".recover-btn");
      recoverBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent card click
        this.recoverOrder(order.id); // you'll define this method next
      });
  
      trashBoard.appendChild(card);
    });
  
    if (trashedOrders.length === 0) {
      trashBoard.innerHTML = "<p>No deleted orders.</p>";
    }
  }
  ,

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
      // ✅ Add drop target events here
      column.addEventListener("dragover", (e) => {
        e.preventDefault();
        column.classList.add("drop-hover");
      });
      column.addEventListener("dragleave", () => {
        column.classList.remove("drop-hover");
      });
      column.addEventListener("drop", (e) => {
        e.preventDefault();
        column.classList.remove("drop-hover");
        const draggedId = e.dataTransfer.getData("text/plain");
        const order = OrderManager.getById(draggedId);
        if (!order) return;
          if (order.status !== status) {
            order.status = status;
            order.statusChangedAt = Date.now();
          }
        order.syncStatus = "moved"; // Optional future use
        order.movedAt = Date.now(); // ⏱️ Track when moved
        OrderManager.save();
        OrderManager.renderKanban();
        // After re-render, apply .moved to the updated card
        setTimeout(() => {
          const movedCard = document.querySelector(`.order-card[data-id="${draggedId}"]`);
          if (movedCard) movedCard.classList.add("moved");
          
          // Remove class after animation completes (optional cleanup)
          setTimeout(() => movedCard.classList.remove("moved"), 300);
        }, 50);
      });
      const statusClass = status.toLowerCase().replace(/\s+/g, "-");
      column.classList.add(statusClass);
      const header = document.createElement("div");
      header.className = "kanban-header";
      header.innerHTML = `<h3>${status}</h3>`;
      // 🔄 NEW: Create scrollable wrapper
      const scrollWrapper = document.createElement("div");
      scrollWrapper.className = "kanban-scroll";
      const filteredOrders = this.orders.filter(o => {
        if (o.status !== status) return false;
        if (o.deletedAt) {
          const oneDay = 24 * 60 * 60 * 1000;
          const timeSinceDelete = Date.now() - o.deletedAt;
          if (timeSinceDelete > oneDay) return false;
        }
        return true;
      });
  
  filteredOrders.forEach(order => {
    const card = document.createElement("div");
    card.className = "order-card";
    card.setAttribute("draggable", "true");
    card.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", order.id);
      card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => {// == DOM Elements ==
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

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (sec < 60) return "Just now";
  if (min < 60) return `${min} min${min === 1 ? "" : "s"} ago`;
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  return `${day} day${day === 1 ? "" : "s"} ago`;
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

  recoverOrder(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;
  
    delete order.deletedAt;
    delete order.syncStatus;
  
    this.save();
    this.renderKanban();
    this.renderTrash();
  
    // Optional: Close detail modal if it’s open and recovering from there
    orderDetailModal.style.display = "none";
    editOrderId = null;
  },  

  getById(id) {
    return this.orders.find(o => o.id == id);
  },

  add(order) {
    order.createdAt = Date.now();
    order.syncStatus = "created";
    this.orders.push(order);
    this.save();
  },

  update(id, updatedOrder) {
    const index = this.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      updatedOrder.updatedAt = Date.now();
      updatedOrder.syncStatus = "updated";
      this.orders[index] = updatedOrder;
      this.save();
    }
  },

  renderTrash() {
    const trashBoard = document.getElementById("trashBoard");
    trashBoard.innerHTML = "";
  
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  
    const trashedOrders = this.orders.filter(order => {
      if (!order.deletedAt) return false;
      const timeSinceDelete = now - order.deletedAt;
      return timeSinceDelete <= thirtyDays;
    });
  
    trashedOrders.forEach(order => {
      const card = document.createElement("div");
      card.className = "order-card deleted";
      card.innerHTML = `
        <strong>${order.id}</strong><br>
        ${order.customerName}<br>
        ${order.orderType}<br>
        <span class="sync-label">🗑️ Deleted</span><br>
        <button class="recover-btn">Recover</button>
      `;
      card.setAttribute("data-id", order.id);
  
      // Open expanded card on card click
      card.addEventListener("click", handleCardClick);
  
      // Prevent Recover button from opening modal
      const recoverBtn = card.querySelector(".recover-btn");
      recoverBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent card click
        this.recoverOrder(order.id); // you'll define this method next
      });
  
      trashBoard.appendChild(card);
    });
  
    if (trashedOrders.length === 0) {
      trashBoard.innerHTML = "<p>No deleted orders.</p>";
    }
  }
  ,

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
      // ✅ Add drop target events here
      column.addEventListener("dragover", (e) => {
        e.preventDefault();
        column.classList.add("drop-hover");
      });
      column.addEventListener("dragleave", () => {
        column.classList.remove("drop-hover");
      });
      column.addEventListener("drop", (e) => {
        e.preventDefault();
        column.classList.remove("drop-hover");
        const draggedId = e.dataTransfer.getData("text/plain");
        const order = OrderManager.getById(draggedId);
        if (!order) return;
          if (order.status !== status) {
            order.status = status;
            order.statusChangedAt = Date.now();
          }
        order.syncStatus = "moved"; // Optional future use
        order.movedAt = Date.now(); // ⏱️ Track when moved
        OrderManager.save();
        OrderManager.renderKanban();
        // After re-render, apply .moved to the updated card
        setTimeout(() => {
          const movedCard = document.querySelector(`.order-card[data-id="${draggedId}"]`);
          if (movedCard) movedCard.classList.add("moved");
          
          // Remove class after animation completes (optional cleanup)
          setTimeout(() => movedCard.classList.remove("moved"), 300);
        }, 50);
      });
      const statusClass = status.toLowerCase().replace(/\s+/g, "-");
      column.classList.add(statusClass);
      const header = document.createElement("div");
      header.className = "kanban-header";
      header.innerHTML = `<h3>${status}</h3>`;
      // 🔄 NEW: Create scrollable wrapper
      const scrollWrapper = document.createElement("div");
      scrollWrapper.className = "kanban-scroll";
      const filteredOrders = this.orders.filter(o => {
        if (o.status !== status) return false;
        if (o.deletedAt) {
          const oneDay = 24 * 60 * 60 * 1000;
          const timeSinceDelete = Date.now() - o.deletedAt;
          if (timeSinceDelete > oneDay) return false;
        }
        return true;
      });
  
  filteredOrders.forEach(order => {
    const card = document.createElement("div");
    card.className = "order-card";
    card.setAttribute("data-id", order.id);

    let syncLabel = "";
    const now = Date.now();

    // Common time label logic (applies to both deleted and active cards)
    let timeLabel = "";
    if (order.statusChangedAt) {
      timeLabel = `<div class="time-label">🕒 ${timeAgo(order.statusChangedAt)}</div>`;
    }

    // Deleted cards
  if (order.deletedAt) {
    card.classList.add("deleted");

    let syncLabel = "";
    const now = Date.now();
    if (order.syncStatus === "deleted" && now - order.deletedAt < 60 * 1000) {
      syncLabel = '<span class="sync-label" title="Deleted">🗑️</span>';
    }

    const timeLabel = `<div class="time-label">🕒 ${timeAgo(order.deletedAt)}</div>`;

    card.innerHTML = `
      <strong>${order.id}</strong><br>
      ${order.customerName}<br>
      ${order.orderType}
      <div class="card-meta">
        ${syncLabel}
        ${timeLabel}
      </div>
    `;
  }

    // Active cards
    else {
      if (order.syncStatus === "moved" && order.movedAt && now - order.movedAt < 60 * 1000) {
        syncLabel = '<span class="sync-label" title="Moved">↔️</span>';
      } else if (order.syncStatus === "created" && order.createdAt && now - order.createdAt < 60 * 1000) {
        syncLabel = '<span class="sync-label" title="Created">🆕</span>';
      } else if (order.syncStatus === "updated" && order.updatedAt && now - order.updatedAt < 60 * 1000) {
        syncLabel = '<span class="sync-label" title="Edited">✏️</span>';
      } else {
        let changed = false;
        ["syncStatus", "movedAt", "createdAt", "updatedAt"].forEach(key => {
          if (order[key]) {
            order[key] = null;
            changed = true;
          }
        });
        if (changed) this.save();
      }

      card.innerHTML = `
        <strong>${order.id}</strong><br>
        ${order.customerName}<br>
        ${order.orderType}
        <div class="card-meta">
          ${syncLabel}
          ${timeLabel}
        </div>
      `;
    }

    card.addEventListener("click", handleCardClick);
    scrollWrapper.appendChild(card);
});


  
      column.appendChild(header);
      column.appendChild(scrollWrapper); // 💡 insert cards into scrollable area
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
    status: "Order Placed",
    statusChangedAt: Date.now()
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
    const isHidden = trashView.classList.contains("hidden");
  
    // Hide all views first
    kanbanView.style.display = "none";
    formView.style.display = "none";
    trashView.classList.add("hidden");
  
    // If it was hidden, show Trash; otherwise go back to Kanban
    if (isHidden) {
      trashView.classList.remove("hidden");
      OrderManager.renderTrash();
    } else {
      showKanban();
    }
  
    hideMenu();
  }
  
  
// == Event Listeners ==
document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("toggleThemeBtn");

// Set initial theme from saved preference
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  themeToggleBtn.textContent = "☀️ Light Mode";
} else {
  themeToggleBtn.textContent = "🌙 Dark Mode";
}

themeToggleBtn.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  if (current === "dark") {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
    themeToggleBtn.textContent = "🌙 Dark Mode";
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    themeToggleBtn.textContent = "☀️ Light Mode";
  }
});

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

      card.classList.remove("dragging");
    });
    if (order.deletedAt) {
      card.classList.add("deleted");
      card.innerHTML = `<strong>${order.id}</strong><br>${order.customerName}<br>${order.orderType}<br><span class="sync-label">🗑️ Sync: Deleted</span>`;
    } else {
      let syncLabel = "";
      if (order.syncStatus === "moved" && order.movedAt) {
        const timeSinceMove = Date.now() - order.movedAt;
        if (timeSinceMove < 60 * 1000) {
          syncLabel = '<span class="sync-label">📦 Sync: Moved</span>';
        } else {
          order.syncStatus = null;
          order.movedAt = null;
          this.save();
        }
      }

      let timeLabel = "";
      if (order.statusChangedAt) {
        timeLabel = `<div class="time-label">🕒 ${timeAgo(order.statusChangedAt)}</div>`;
      }

      card.innerHTML = `
        <strong>${order.id}</strong><br>
        ${order.customerName}<br>
        ${order.orderType}
        ${syncLabel}
        ${timeLabel}
      `;
    }

    card.setAttribute("data-id", order.id);
    card.addEventListener("click", handleCardClick);
    scrollWrapper.appendChild(card);
});

  
      column.appendChild(header);
      column.appendChild(scrollWrapper); // 💡 insert cards into scrollable area
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
    status: "Order Placed",
    statusChangedAt: Date.now()
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
    const isHidden = trashView.classList.contains("hidden");
  
    // Hide all views first
    kanbanView.style.display = "none";
    formView.style.display = "none";
    trashView.classList.add("hidden");
  
    // If it was hidden, show Trash; otherwise go back to Kanban
    if (isHidden) {
      trashView.classList.remove("hidden");
      OrderManager.renderTrash();
    } else {
      showKanban();
    }
  
    hideMenu();
  }
  
  
// == Event Listeners ==
document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("toggleThemeBtn");

// Set initial theme from saved preference
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  themeToggleBtn.textContent = "☀️ Light Mode";
} else {
  themeToggleBtn.textContent = "🌙 Dark Mode";
}

themeToggleBtn.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  if (current === "dark") {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
    themeToggleBtn.textContent = "🌙 Dark Mode";
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    themeToggleBtn.textContent = "☀️ Light Mode";
  }
});

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
