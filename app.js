// OfflinePay — Demo Offline Payment Engine
// Demo money only. No bank, UPI, or real-money connection.

const STORAGE_KEY = "offlinepay_demo_wallet";

const defaultState = {
  balance: 1000,
  transactions: [
    {
      title: "Payment received",
      person: "Demo transaction",
      amount: 250,
      type: "received",
      status: "completed",
      time: Date.now() - 60000
    },
    {
      title: "Payment sent",
      person: "Demo transaction",
      amount: 100,
      type: "sent",
      status: "completed",
      time: Date.now() - 120000
    }
  ]
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return structuredClone(defaultState);
    }

    const parsed = JSON.parse(saved);

    if (
      typeof parsed.balance !== "number" ||
      !Array.isArray(parsed.transactions)
    ) {
      return structuredClone(defaultState);
    }

    return parsed;
  } catch {
    return structuredClone(defaultState);
  }
}

let state = loadState();

const balanceElement = document.getElementById("balance");
const transactionsElement = document.getElementById("transactions");
const sendButton = document.getElementById("sendButton");
const receiveButton = document.getElementById("receiveButton");

const navItems = document.querySelectorAll(".nav-item");
const activitySection = document.querySelector(".activity");
const viewAllButton = document.querySelector(".section-header button");

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateBalance() {
  balanceElement.textContent = state.balance.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function statusText(status) {
  if (status === "pending") {
    return "Pending sync";
  }

  return "Completed";
}

function renderTransactions(limit = null) {
  transactionsElement.innerHTML = "";

  const transactions = limit
    ? state.transactions.slice(0, limit)
    : state.transactions;

  if (transactions.length === 0) {
    transactionsElement.innerHTML = `
      <div class="transaction">
        <div class="transaction-info">
          <strong>No transactions yet</strong>
          <span>Your demo activity will appear here.</span>
        </div>
      </div>
    `;

    return;
  }

  transactions.forEach((item) => {
    const transaction = document.createElement("div");
    transaction.className = "transaction";

    const icon = item.type === "received"
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
      item.type === "received"
        ? `+₹${Number(item.amount).toFixed(2)}`
        : `−₹${Number(item.amount).toFixed(2)}`;

    transaction.innerHTML = `
      ${icon}

      <div class="transaction-info">
        <strong>${escapeHTML(item.title)}</strong>
        <span>
          ${escapeHTML(item.person)} ·
          <span class="status ${item.status}">
            ${statusText(item.status)}
          </span>
        </span>
      </div>

      <strong class="amount ${
        item.type === "received" ? "positive" : "negative"
      }">
        ${formattedAmount}
      </strong>
    `;

    transactionsElement.appendChild(transaction);
  });
}

function addTransaction(title, amount, type, person, status = "completed") {
  state.transactions.unshift({
    title,
    person,
    amount,
    type,
    status,
    time: Date.now()
  });

  saveState();
  renderTransactions(5);
}

function showSendScreen() {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <div>
          <p class="eyebrow">OFFLINE DEMO</p>
          <h2>Send money</h2>
        </div>

        <button class="modal-close" aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12"></path>
            <path d="M18 6 6 18"></path>
          </svg>
        </button>
      </div>

      <div class="offline-notice">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h14"></path>
          <path d="M12 5v14"></path>
        </svg>
        <div>
          <strong>Offline mode</strong>
          <span>This demo payment will be stored as pending.</span>
        </div>
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
        <strong>₹${state.balance.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}</strong>
      </div>

      <button class="primary-button" id="confirmSendButton">
        Create pending payment
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

  overlay.querySelector(".modal-close").addEventListener(
    "click",
    closeModal
  );

  document.getElementById("cancelSendButton").addEventListener(
    "click",
    closeModal
  );

  document.getElementById("confirmSendButton").addEventListener(
    "click",
    () => {
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

      if (amount > state.balance) {
        alert("Insufficient demo balance.");
        amountInput.focus();
        return;
      }

      state.balance -= amount;

      addTransaction(
        "Payment sent",
        amount,
        "sent",
        note ? `${recipient} • ${note}` : recipient,
        "pending"
      );

      updateBalance();
      closeModal();
    }
  );
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

  overlay.querySelector(".modal-close").addEventListener(
    "click",
    closeModal
  );

  document.getElementById("cancelReceiveButton").addEventListener(
    "click",
    closeModal
  );

  document.getElementById("confirmReceiveButton").addEventListener(
    "click",
    () => {
      const amount = Number(amountInput.value);
      const sender = senderInput.value.trim() || "Demo sender";

      if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        amountInput.focus();
        return;
      }

      state.balance += amount;

      addTransaction(
        "Payment received",
        amount,
        "received",
        sender,
        "completed"
      );

      updateBalance();
      closeModal();
    }
  );
}

function syncPendingPayments() {
  const pending = state.transactions.filter(
    (transaction) => transaction.status === "pending"
  );

  if (pending.length === 0) {
    alert("No pending demo payments.");
    return;
  }

  pending.forEach((transaction) => {
    transaction.status = "completed";
  });

  saveState();
  renderTransactions();

  alert(`${pending.length} demo payment(s) synced.`);
}

function showAllActivity() {
  renderTransactions();

  const syncButton = document.createElement("button");
  syncButton.className = "sync-button";
  syncButton.textContent = "Sync pending payments";

  syncButton.addEventListener("click", syncPendingPayments);

  activitySection.insertBefore(
    syncButton,
    transactionsElement
  );

  activitySection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function showHome() {
  renderTransactions(5);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

sendButton.addEventListener("click", showSendScreen);
receiveButton.addEventListener("click", showReceiveQR);

navItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    navItems.forEach((nav) => nav.classList.remove("active"));
    item.classList.add("active");

    if (index === 0) {
      showHome();
    }

    if (index === 1) {
      showAllActivity();
    }

    if (index === 2) {
      alert(
        "OfflinePay Demo Profile\n\n" +
        "Account: Demo User\n" +
        "Status: Prototype\n" +
        "Money: Demo only"
      );
    }
  });
});

viewAllButton.addEventListener("click", showAllActivity);

updateBalance();
renderTransactions(5);// Demo QR receiving

function showReceiveQR() {
  const root = document.getElementById("qrModalRoot");

  const demoPayload =
    "OFFLINEPAY-DEMO|USER:offlinepay-demo-001";

  root.innerHTML = `
    <div class="modal-overlay">
      <div class="modal qr-modal">

        <div class="modal-header">
          <div>
            <p class="eyebrow">OFFLINEPAY DEMO</p>
            <h2>Receive with QR</h2>
          </div>

          <button class="modal-close" id="closeQRButton" aria-label="Close">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12"></path>
              <path d="M18 6 6 18"></path>
            </svg>
          </button>
        </div>

        <div class="qr-box">
          <div id="realQRCode" class="real-qr"></div>
        </div>

        <div class="qr-user">
          <strong>Demo User</strong>
          <span>offlinepay-demo-001</span>
        </div>

        <p class="modal-description qr-description">
          Demo QR only. Scanning this code does not move real money.
        </p>

        <button class="secondary-button" id="closeQRSecondary">
          Close
        </button>

      </div>
    </div>
  `;

  new QRCode(document.getElementById("realQRCode"), {
    text: demoPayload,
    width: 190,
    height: 190,
    correctLevel: QRCode.CorrectLevel.M
  });

  function closeQR() {
    root.innerHTML = "";
  }

  document
    .getElementById("closeQRButton")
    .addEventListener("click", closeQR);

  document
    .getElementById("closeQRSecondary")
    .addEventListener("click", closeQR);
}