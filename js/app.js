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
    images: formData.getAll("images")
  };

  console.log("New Order:", order);
  alert("Order captured (check console).");
});
