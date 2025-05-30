const statuses = [
  "Order Placed",
  "Design",
  "Waiting for Approval",
  "Approved",
  "Printing",
  "Ready for Pickup",
  "Completed"
];

// Load saved orders or start empty
let orders = JSON.parse(localStorage.getItem("orders")) || [];

function showKanban() {
  document.getElementById("kanbanView").style.display = "flex";
  document.getElementById("formView").style.display = "none";
}

function showForm() {
  document.getElementById("formView").style.display = "block";
  document.getElementById("kanbanView").style.display = "none";
}

// Render the Kanban board
function renderKanban(ordersToRender) {
  const board = document.getElementById("kanbanBoard");
  board.innerHTML = ""; // Clear board

  statuses.forEach(status => {
    const column = document.createElement("div");
    column.className = "kanban-column";
    const statusClass = status.toLowerCase().replace(/\s+/g, "-");
    column.classList.add(statusClass); // adds a class like 'order-placed' or 'ready-for-pickup'

    column.innerHTML = `<div class="kanban-header"><h3>${status}</h3></div>`;

    const filteredOrders = ordersToRender.filter(o => o.status === status);
    filteredOrders.forEach(order => {
      const card = document.createElement("div");
      card.className = "order-card";
      card.innerHTML = `<strong>${order.id}</strong><br>${order.customerName}<br>${order.orderType}`;
      column.appendChild(card);
    });

    board.appendChild(column);
  });
}

// On page load
renderKanban(orders);

// Handle form submission
document.getElementById("orderForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const order = {
    id: Math.floor(10000 + Math.random() * 90000), // auto-generate 5-digit ID
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    orderType: formData.get("orderType"),
    description: formData.get("description"),
    downPayment: parseFloat(formData.get("downPayment") || 0),
    balanceDue: parseFloat(formData.get("balanceDue") || 0),
    orderDate: formData.get("orderDate"),
    designDate: formData.get("designDate"),
    notes: formData.get("notes"),
    images: formData.getAll("images"),
    status: "Order Placed" // All new orders start here
  };

  orders.push(order);
  localStorage.setItem("orders", JSON.stringify(orders));
  renderKanban(orders);

  console.log("New Order:", order);
  alert("Order saved and added to board.");
  e.target.reset();
});
