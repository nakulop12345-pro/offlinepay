// OfflinePay — Demo Wallet Engine
// IMPORTANT: This prototype uses demo money only.
// It does not connect to banks, UPI, or real payment systems.

let balance = 1000;

const balanceElement = document.getElementById("balance");
const transactionsElement = document.getElementById("transactions");

function updateBalance() {
  balanceElement.textContent = balance.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function addTransaction(title, amount, type) {
  const transaction = document.createElement("div");
  transaction.className = "transaction";

  const icon = type === "received"
    ? `
      <div class="transaction-icon received">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14"></path>
          <path d="m6 13 6 6 6-6"></path>
        </svg>
      </div>
    `
    : `
      <div class="transaction-icon sent">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 19V5"></path>
          <path d="m18 11-6-6-6 6"></path>
        </svg>
      </div>
    `;

  const formattedAmount =
    type === "received"
      ? `+₹${amount}`
      : `−₹${amount}`;

  transaction.innerHTML = `
    ${icon}

    <div class="transaction-info">
      <strong>${title}</strong>
      <span>Demo transaction</span>
    </div>

    <strong class="amount ${type === "received" ? "positive" : "negative"}">
      ${formattedAmount}
    </strong>
  `;

  transactionsElement.prepend(transaction);
}

function sendMoney() {
  const amount = prompt("Enter demo amount to send:");

  if (amount === null) return;

  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  if (value > balance) {
    alert("Insufficient demo balance.");
    return;
  }

  balance -= value;

  updateBalance();

  addTransaction(
    "Payment sent",
    value.toFixed(2),
    "sent"
  );
}

function receiveMoney() {
  const amount = prompt("Enter demo amount to receive:");

  if (amount === null) return;

  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  balance += value;

  updateBalance();

  addTransaction(
    "Payment received",
    value.toFixed(2),
    "received"
  );
}

document
  .getElementById("sendButton")
  .addEventListener("click", sendMoney);

document
  .getElementById("receiveButton")
  .addEventListener("click", receiveMoney);

updateBalance();