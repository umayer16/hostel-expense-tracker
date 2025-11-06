let expenses = JSON.parse(localStorage.getItem("expenses") || "[]");
let editIndex = null; // Track which expense is being edited

function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

// Add or Update expense
function addExpense() {
  const category = document.getElementById("category").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const date = document.getElementById("date").value;

  if (!category || !amount || !date) {
    alert("Please fill all fields.");
    return;
  }

  if (editIndex !== null) {
    // Update existing expense
    expenses[editIndex] = { category, amount, date };
    editIndex = null;
    document.querySelector('button[onclick="addExpense()"]').innerText = "Add Expense";
  } else {
    expenses.push({ category, amount, date });
  }

  saveExpenses();
  displayExpenses();
  updateSummary();
  drawCharts();

  // Clear inputs
  document.getElementById("category").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("date").value = "";
}

// Display expenses in table
function displayExpenses() {
  const table = document.getElementById("expenseTable");
  table.innerHTML = `
    <tr>
      <th>Date</th>
      <th>Category</th>
      <th>Amount</th>
      <th>Actions</th>
    </tr>
  `;

  expenses.forEach((e, index) => {
    const row = table.insertRow();
    row.insertCell(0).innerText = e.date;
    row.insertCell(1).innerText = e.category;
    row.insertCell(2).innerText = e.amount.toFixed(2);

    const actionsCell = row.insertCell(3);
    actionsCell.innerHTML = `
      <button onclick="editExpense(${index})">Edit</button>
      <button onclick="deleteExpense(${index})">Delete</button>
    `;
  });
}

// Edit an expense
function editExpense(index) {
  const e = expenses[index];
  document.getElementById("category").value = e.category;
  document.getElementById("amount").value = e.amount;
  document.getElementById("date").value = e.date;
  editIndex = index;
  document.querySelector('button[onclick="addExpense()"]').innerText = "Update Expense";
}

// Delete an expense
function deleteExpense(index) {
  if (confirm("Are you sure you want to delete this expense?")) {
    expenses.splice(index, 1);
    saveExpenses();
    displayExpenses();
    updateSummary();
    drawCharts();
  }
}

// Summarize by category
function summarize() {
  const summary = {};
  expenses.forEach(e => summary[e.category] = (summary[e.category] || 0) + e.amount);
  return summary;
}

// Total expenses over time
function expensesOverTime() {
  const daily = {};
  expenses.forEach(e => daily[e.date] = (daily[e.date] || 0) + e.amount);
  return Object.fromEntries(Object.entries(daily).sort());
}

// Update summary list
function updateSummary() {
  const summary = summarize();
  const ul = document.getElementById("summaryList");
  ul.innerHTML = "";
  for (const [cat, amt] of Object.entries(summary)) {
    const li = document.createElement("li");
    li.innerText = `${cat}: ${amt.toFixed(2)}`;
    ul.appendChild(li);
  }
}

// Draw charts
function drawCharts() {
  const sum = summarize();
  const categories = Object.keys(sum);
  const amounts = Object.values(sum);

  const daily = expensesOverTime();
  const dates = Object.keys(daily);
  const totals = Object.values(daily);

  if (window.barChart) window.barChart.destroy();
  if (window.pieChart) window.pieChart.destroy();
  if (window.lineChart) window.lineChart.destroy();

  const barCtx = document.getElementById('barChart').getContext('2d');
  window.barChart = new Chart(barCtx, {
    type: 'bar',
    data: { labels: categories, datasets: [{label: 'Expenses', data: amounts, backgroundColor: 'skyblue'}] }
  });

  const pieCtx = document.getElementById('pieChart').getContext('2d');
  window.pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: { labels: categories, datasets: [{data: amounts, backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40']}] }
  });

  const lineCtx = document.getElementById('lineChart').getContext('2d');
  window.lineChart = new Chart(lineCtx, {
    type: 'line',
    data: { labels: dates, datasets: [{label: 'Expenses Over Time', data: totals, borderColor: 'green', fill: false, tension: 0.3}] }
  });
}

// Initialize
displayExpenses();
updateSummary();
drawCharts();
