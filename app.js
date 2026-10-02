// OfflinePay — Demo Wallet Engine
// Demo money only. No bank, UPI, or real-money connection.

let balance = 1000;

const balanceElement = document.getElementById("balance");
const transactionsElement = document.getElementById("transactions");
const sendButton = document.getElementById("sendButton");
const receiveButton = document.getElementById("receiveButton");

function updateBalance() {
  balanceElement.textContent = balance.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function addTransaction(title, amount, type, person = "Demo transaction") {
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
      ? `+₹${Number(amount).toFixed(2)}`
      : `−₹${Number(amount).toFixed(2)}`;

  transaction.innerHTML = `
    ${icon}

    <div class="transaction-info">
      <strong>${title}</strong>
      <span>${person}</span>
    </div>

    <strong class="amount ${type === "received" ? "positive" : "negative"}">
      ${formattedAmount}
    </strong>
  `;

  transactionsElement.prepend(transaction);
}

function showSendScreen() {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <div>
          <p class="eyebrow">DEMO PAYMENT</p>
          <h2>Send money</h2>
        </div>

        <button class="modal-close" aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12"></path>
            <path d="M18 6 6 18"></path>
          </svg>
        </button>
      </div>

      <label>
        Recipient
        <input
          id="recipientInput"
          type="text"
          placeholder="Name or demo ID"
          autocomplete="off"
        >
      </label>

      <label>
        Amount
        <div class="amount-input">
          <span>₹</span>
          <input
            id="sendAmountInput"
            type="number"
            min="1"
            step="0.01"
            placeholder="0.00"
          >
        </div>
      </label>

      <label>
        Note
        <input
          id="noteInput"
          type="text"
          placeholder="Optional note"
          autocomplete="off"
        >
      </label>

      <div class="available-box">
        <span>Available demo balance</span>
        <strong>₹${balance.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}</strong>
      </div>

      <button class="primary-button" id="confirmSendButton">
        Confirm send
      </button>

      <button class="secondary-button" id="cancelSendButton">
        Cancel
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  const recipientInput = document.getElementById("recipientInput");
  const amountInput = document.getElementById("sendAmountInput");
  const noteInput = document.getElementById("noteInput");

  recipientInput.focus();

  function closeModal() {
    overlay.remove();
  }

  document
    .querySelector(".modal-close")
    .addEventListener("click", closeModal);

  document
    .getElementById("cancelSendButton")
    .addEventListener("click", closeModal);

  document
    .getElementById("confirmSendButton")
    .addEventListener("click", () => {
      const recipient = recipientInput.value.trim();
      const amount = Number(amountInput.value);
      const note = noteInput.value.trim();

      if (!recipient) {
        alert("Please enter a recipient.");
        recipientInput.focus();
        return;
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        amountInput.focus();
        return;
      }

      if (amount > balance) {
        alert("Insufficient demo balance.");
        amountInput.focus();
        return;
      }

      balance -= amount;
      updateBalance();

      addTransaction(
        "Payment sent",
        amount,
        "sent",
        note ? `${recipient} • ${note}` : recipient
      );

      closeModal();
    });
}

function showReceiveScreen() {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <div>
          <p class="eyebrow">DEMO PAYMENT</p>
          <h2>Receive money</h2>
        </div>

        <button class="modal-close" aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12"></path>
            <path d="M18 6 6 18"></path>
          </svg>
        </button>
      </div>

      <p class="modal-description">
        Add demo money to your OfflinePay balance.
      </p>

      <label>
        Amount
        <div class="amount-input">
          <span>₹</span>
          <input
            id="receiveAmountInput"
            type="number"
            min="1"
            step="0.01"
            placeholder="0.00"
          >
        </div>
      </label>

      <label>
        From
        <input
          id="senderInput"
          type="text"
          placeholder="Name or demo ID"
          autocomplete="off"
        >
      </label>

      <button class="primary-button" id="confirmReceiveButton">
        Add demo payment
      </button>

      <button class="secondary-button" id="cancelReceiveButton">
        Cancel
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  const amountInput = document.getElementById("receiveAmountInput");
  const senderInput = document.getElementById("senderInput");

  amountInput.focus();

  function closeModal() {
    overlay.remove();
  }

  document
    .querySelector(".modal-close")
    .addEventListener("click", closeModal);

  document
    .getElementById("cancelReceiveButton")
    .addEventListener("click", closeModal);

  document
    .getElementById("confirmReceiveButton")
    .addEventListener("click", () => {
      const amount = Number(amountInput.value);
      const sender = senderInput.value.trim() || "Demo sender";

      if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        amountInput.focus();
        return;
      }

      balance += amount;
      updateBalance();

      addTransaction(
        "Payment received",
        amount,
        "received",
        sender
      );

      closeModal();
    });
}

sendButton.addEventListener("click", showSendScreen);
receiveButton.addEventListener("click", showReceiveScreen);

updateBalance();