/* =========================================================
   MY STORE POS — V2 SCRIPT
   ========================================================= */

"use strict";

/* =========================================================
   DATA
   ========================================================= */

let products = [];
let sales = [];
let expenses = [];
let cart = [];

let storeSettings = {
  storeName: "My Store",
  ownerName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  currency: "₦"
};

/* =========================================================
   LOAD DATA
   ========================================================= */

function loadJSON(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (error) {
    console.error("Could not load:", key, error);
    return fallback;
  }
}

products = loadJSON("posProducts", []);
sales = loadJSON("posSales", []);
expenses = loadJSON("posExpenses", []);
storeSettings = {
  ...storeSettings,
  ...loadJSON("posStoreSettings", {})
};

/* =========================================================
   SAVE DATA
   ========================================================= */

function saveData() {
  localStorage.setItem("posProducts", JSON.stringify(products));
  localStorage.setItem("posSales", JSON.stringify(sales));
  localStorage.setItem("posExpenses", JSON.stringify(expenses));
}

function saveStoreSettings() {
  localStorage.setItem(
    "posStoreSettings",
    JSON.stringify(storeSettings)
  );
}

/* =========================================================
   HELPERS
   ========================================================= */

function money(value) {
  return (
    storeSettings.currency +
    Number(value || 0).toLocaleString()
  );
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function todayString() {
  return new Date().toDateString();
}

function getTodaySales() {
  return sales.filter(function (sale) {
    return new Date(sale.date).toDateString() === todayString();
  });
}

function getRevenue() {
  return sales.reduce(function (sum, sale) {
    return sum + Number(sale.total || 0);
  }, 0);
}

function getCost() {
  return sales.reduce(function (sum, sale) {
    return (
      sum +
      (sale.items || []).reduce(function (itemSum, item) {
        return (
          itemSum +
          Number(item.costPrice || 0) *
            Number(item.quantity || 0)
        );
      }, 0)
    );
  }, 0);
}

function getGrossProfit() {
  return getRevenue() - getCost();
}

function getExpenseTotal() {
  return expenses.reduce(function (sum, expense) {
    return sum + Number(expense.amount || 0);
  }, 0);
}

function getNetProfit() {
  return getGrossProfit() - getExpenseTotal();
}

/* =========================================================
   NAVIGATION
   ========================================================= */

window.openPage = function (pageId, button) {
  document.querySelectorAll(".page").forEach(function (page) {
    page.classList.remove("active");
  });

  const page = document.getElementById(pageId);

  if (page) {
    page.classList.add("active");
  }

  document
    .querySelectorAll(
      ".side-item, .mobile-nav-item, .nav-item"
    )
    .forEach(function (item) {
      item.classList.remove("active");
    });

  if (button) {
    button.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  refreshCurrentPage(pageId);
};

function refreshCurrentPage(pageId) {
  switch (pageId) {
    case "homePage":
      renderDashboard();
      renderRecentSales();
      break;

    case "posPage":
      renderPOSProducts();
      renderCart();
      break;

    case "inventoryPage":
      renderInventory();
      break;

    case "customersPage":
      renderCustomers();
      break;

    case "salesPage":
      renderSales();
      break;

    case "expensesPage":
      renderExpenses();
      break;

    case "reportsPage":
      renderReports();
      break;

    case "settingsPage":
      loadSettingsForm();
      break;
  }
};

/* =========================================================
   PRODUCT MANAGEMENT
   ========================================================= */

function addProduct(data) {
  const product = {
    id: Date.now(),
    name: data.name,
    category: data.category || "General",
    sku: data.sku || "",
    costPrice: Number(data.costPrice || 0),
    retailPrice: Number(data.retailPrice || 0),
    wholesalePrice: Number(data.wholesalePrice || 0),
    stock: Number(data.stock || 0),
    lowStock: Number(data.lowStock || 5)
  };

  products.push(product);
  saveData();

  renderInventory();
  renderPOSProducts();
  renderDashboard();
}

window.deleteProduct = function (index) {
  const product = products[index];

  if (!product) return;

  if (
    !confirm(
      'Delete "' + product.name + '" from inventory?'
    )
  ) {
    return;
  }

  products.splice(index, 1);

  saveData();

  renderInventory();
  renderPOSProducts();
  renderDashboard();
};

function renderInventory() {
  const list =
    document.getElementById("productList") ||
    document.getElementById("inventoryList");

  if (!list) return;

  if (!products.length) {
    list.innerHTML =
      '<div class="empty">No products yet.</div>';
    return;
  }

  list.innerHTML = products
    .map(function (product, index) {
      const stock = Number(product.stock);

      let status = "In stock";

      if (stock <= 0) {
        status = "Out of stock";
      } else if (stock <= Number(product.lowStock || 5)) {
        status = "Low stock";
      }

      return `
        <div class="product-card">

          <div class="product-top">
            <div>
              <strong>
                ${escapeHTML(product.name)}
              </strong>

              <small>
                ${escapeHTML(product.category)}
              </small>

              ${
                product.sku
                  ? `<small>SKU: ${escapeHTML(product.sku)}</small>`
                  : ""
              }
            </div>

            <strong>
              ${stock}
            </strong>
          </div>

          <div class="product-price">
            Cost: ${money(product.costPrice)}
          </div>

          <div class="product-price">
            Retail: ${money(product.retailPrice)}
          </div>

          <div class="product-price">
            Wholesale: ${money(product.wholesalePrice)}
          </div>

          <div class="stock">
            ${status}
          </div>

          <button
            type="button"
            onclick="deleteProduct(${index})"
          >
            🗑 Delete
          </button>

        </div>
      `;
    })
    .join("");
}

/* =========================================================
   POS PRODUCTS
   ========================================================= */

function renderPOSProducts() {
  const box =
    document.getElementById("saleProducts") ||
    document.getElementById("posProducts") ||
    document.getElementById("homeSaleProducts");

  if (!box) return;

  const searchInput =
    document.getElementById("productSearch") ||
    document.getElementById("homeProductSearch");

  const search = searchInput
    ? searchInput.value.trim().toLowerCase()
    : "";

  const filtered = products.filter(function (product) {
    return product.name.toLowerCase().includes(search);
  });

  if (!filtered.length) {
    box.innerHTML =
      '<div class="empty">No products found.</div>';
    return;
  }

  box.innerHTML = filtered
    .map(function (product) {
      const index = products.indexOf(product);

      const disabled =
        Number(product.stock) <= 0
          ? "disabled"
          : "";

      return `
        <div class="sale-product">

          <div class="sale-product-info">
            <strong>
              ${escapeHTML(product.name)}
            </strong>

            <small>
              ${money(product.retailPrice)}
              • Stock: ${product.stock}
            </small>
          </div>

          <button
            type="button"
            onclick="addToCart(${index})"
            ${disabled}
          >
            ${
              Number(product.stock) <= 0
                ? "Out of Stock"
                : "+ Add"
            }
          </button>

        </div>
      `;
    })
    .join("");
}

window.addToCart = function (index) {
  const product = products[index];

  if (!product) return;

  if (Number(product.stock) <= 0) {
    alert("This product is out of stock.");
    return;
  }

  const existing = cart.find(function (item) {
    return item.productId === product.id;
  });

  if (existing) {
    if (existing.quantity >= product.stock) {
      alert("Not enough stock.");
      return;
    }

    existing.quantity++;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: Number(product.retailPrice),
      costPrice: Number(product.costPrice),
      quantity: 1,
      discount: 0
    });
  }

  renderCart();
};

/* =========================================================
   CART
   ========================================================= */

function getCartTotal() {
  return cart.reduce(function (total, item) {
    const subtotal =
      Number(item.price) * Number(item.quantity);

    return total + subtotal - Number(item.discount || 0);
  }, 0);
}

function renderCart() {
  const box =
    document.getElementById("cart") ||
    document.getElementById("posCart");

  if (!box) return;

  if (!cart.length) {
    box.innerHTML =
      '<div class="empty">Cart is empty.</div>';
  } else {
    box.innerHTML = cart
      .map(function (item, index) {
        const subtotal =
          Number(item.price) *
          Number(item.quantity);

        return `
          <div class="cart-item">

            <div class="cart-row">
              <strong>
                ${escapeHTML(item.name)}
              </strong>

              <strong>
                ${money(subtotal)}
              </strong>
            </div>

            <small>
              ${money(item.price)} × ${item.quantity}
            </small>

            <div class="quantity-controls">

              <button
                type="button"
                onclick="decreaseQuantity(${index})"
              >
                −
              </button>

              <span>
                ${item.quantity}
              </span>

              <button
                type="button"
                onclick="increaseQuantity(${index})"
              >
                +
              </button>

              <button
                type="button"
                onclick="removeFromCart(${index})"
              >
                Remove
              </button>

            </div>

          </div>
        `;
      })
      .join("");
  }

  const totalElement =
    document.getElementById("cartTotal") ||
    document.getElementById("homeCartTotal");

  if (totalElement) {
    totalElement.textContent = money(getCartTotal());
  }

  calculateChange();
}

window.increaseQuantity = function (index) {
  const item = cart[index];

  if (!item) return;

  const product = products.find(function (p) {
    return p.id === item.productId;
  });

  if (!product) return;

  if (item.quantity >= product.stock) {
    alert("Not enough stock.");
    return;
  }

  item.quantity++;
  renderCart();
};

window.decreaseQuantity = function (index) {
  const item = cart[index];

  if (!item) return;

  if (item.quantity > 1) {
    item.quantity--;
  } else {
    cart.splice(index, 1);
  }

  renderCart();
};

window.removeFromCart = function (index) {
  cart.splice(index, 1);
  renderCart();
};

/* =========================================================
   COMPLETE SALE
   ========================================================= */

window.completeSale = function () {
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }

  const customerName =
    getValue("customerName");

  const customerPhone =
    getValue("customerPhone");

  const amountPaid =
    Number(getValue("amountPaid") || 0);

  const paymentMethod =
    getValue("paymentMethod") || "Cash";

  const total = getCartTotal();

  if (amountPaid < total) {
    alert(
      "Amount paid is not enough.\n\nTotal: " +
        money(total)
    );
    return;
  }

  const change = amountPaid - total;

  cart.forEach(function (item) {
    const product = products.find(function (p) {
      return p.id === item.productId;
    });

    if (product) {
      product.stock -= item.quantity;

      if (product.stock < 0) {
        product.stock = 0;
      }
    }
  });

  const sale = {
    id: Date.now(),
    date: new Date().toISOString(),
    customerName:
      customerName || "Walk-in Customer",
    customerPhone,
    paymentMethod,
    items: cart.map(function (item) {
      return {
        name: item.name,
        price: item.price,
        costPrice: item.costPrice,
        quantity: item.quantity,
        discount: item.discount || 0
      };
    }),
    total,
    paid: amountPaid,
    change,
    profit: cart.reduce(function (sum, item) {
      return (
        sum +
        (Number(item.price) -
          Number(item.costPrice || 0)) *
          Number(item.quantity)
      );
    }, 0)
  };

  sales.unshift(sale);

  saveData();

  cart = [];

  clearInput("customerName");
  clearInput("customerPhone");
  clearInput("amountPaid");

  renderCart();
  renderInventory();
  renderPOSProducts();
  renderDashboard();
  renderSales();
  renderCustomers();
  renderReports();

  showReceipt(sale);

  alert("✅ Sale completed successfully.");
};

const completeSaleButton =
  document.getElementById("completeSaleButton");

if (completeSaleButton) {
  completeSaleButton.addEventListener(
    "click",
    window.completeSale
  );
}

/* =========================================================
   PAYMENT / CHANGE
   ========================================================= */

function calculateChange() {
  const box =
    document.getElementById("changeDisplay");

  if (!box) return;

  const paid =
    Number(getValue("amountPaid") || 0);

  const total = getCartTotal();

  if (!paid || !total) {
    box.innerHTML = "";
    return;
  }

  if (paid < total) {
    box.innerHTML = `
      <strong>
        Amount remaining: ${money(total - paid)}
      </strong>
    `;
  } else {
    box.innerHTML = `
      <strong>
        Change: ${money(paid - total)}
      </strong>
    `;
  }
}

/* =========================================================
   CUSTOMERS
   ========================================================= */

function getCustomers() {
  const map = {};

  sales.forEach(function (sale) {
    const key =
      sale.customerPhone ||
      sale.customerName ||
      "Walk-in Customer";

    if (!map[key]) {
      map[key] = {
        name:
          sale.customerName ||
          "Walk-in Customer",
        phone:
          sale.customerPhone || "",
        purchases: 0,
        spent: 0
      };
    }

    map[key].purchases++;
    map[key].spent += Number(sale.total || 0);
  });

  return Object.values(map);
}

function renderCustomers() {
  const box =
    document.getElementById("customerList") ||
    document.getElementById("customersList");

  if (!box) return;

  const customers = getCustomers();

  if (!customers.length) {
    box.innerHTML =
      '<div class="empty">No customers yet.</div>';
    return;
  }

  box.innerHTML = customers
    .map(function (customer) {
      return `
        <div class="history-card">

          <h3>
            👤 ${escapeHTML(customer.name)}
          </h3>

          <p>
            Phone:
            ${escapeHTML(customer.phone)}
          </p>

          <p>
            Purchases:
            ${customer.purchases}
          </p>

          <p>
            Total spent:
            <strong>${money(customer.spent)}</strong>
          </p>

        </div>
      `;
    })
    .join("");
}

/* =========================================================
   SALES
   ========================================================= */

function renderSales() {
  const box =
    document.getElementById("salesHistory") ||
    document.getElementById("salesList");

  if (!box) return;

  if (!sales.length) {
    box.innerHTML =
      '<div class="empty">No sales yet.</div>';
    return;
  }

  box.innerHTML = sales
    .map(function (sale) {
      const profit =
        sale.profit !== undefined
          ? Number(sale.profit)
          : 0;

      return `
        <div class="history-card">

          <strong>
            🧾 Sale #${sale.id}
          </strong>

          <p>
            ${new Date(sale.date).toLocaleString()}
          </p>

          <p>
            Customer:
            ${escapeHTML(
              sale.customerName || "Walk-in Customer"
            )}
          </p>

          <p>
            Payment:
            ${escapeHTML(
              sale.paymentMethod || "Cash"
            )}
          </p>

          <p>
            Total:
            <strong>${money(sale.total)}</strong>
          </p>

          <p>
            Profit:
            <strong>${money(profit)}</strong>
          </p>

        </div>
      `;
    })
    .join("");
}

/* =========================================================
   EXPENSES
   ========================================================= */

window.addExpense = function () {
  const category =
    getValue("expenseCategory") || "Other";

  const amount =
    Number(getValue("expenseAmount") || 0);

  const notes =
    getValue("expenseNotes");

  if (amount <= 0) {
    alert("Enter a valid expense amount.");
    return;
  }

  expenses.unshift({
    id: Date.now(),
    category,
    amount,
    notes,
    date: new Date().toISOString()
  });

  saveData();

  clearInput("expenseAmount");
  clearInput("expenseNotes");

  renderExpenses();
  renderDashboard();
  renderReports();
};

window.deleteExpense = function (index) {
  if (!expenses[index]) return;

  if (!confirm("Delete this expense?")) {
    return;
  }

  expenses.splice(index, 1);

  saveData();

  renderExpenses();
  renderDashboard();
  renderReports();
};

function renderExpenses() {
  const box =
    document.getElementById("expenseList") ||
    document.getElementById("expensesList");

  if (!box) return;

  if (!expenses.length) {
    box.innerHTML =
      '<div class="empty">No expenses recorded.</div>';
    return;
  }

  box.innerHTML = expenses
    .map(function (expense, index) {
      return `
        <div class="history-card">

          <strong>
            ${escapeHTML(expense.category)}
          </strong>

          <p>
            ${money(expense.amount)}
          </p>

          <small>
            ${new Date(
              expense.date
            ).toLocaleString()}
          </small>

          ${
            expense.notes
              ? `<p>${escapeHTML(expense.notes)}</p>`
              : ""
          }

          <button
            type="button"
            onclick="deleteExpense(${index})"
          >
            🗑 Delete
          </button>

        </div>
      `;
    })
    .join("");
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {
  const revenue = getRevenue();
  const grossProfit = getGrossProfit();
  const expensesTotal = getExpenseTotal();
  const netProfit = getNetProfit();

  setText(
    ["revenue", "totalRevenue", "dashboardRevenue"],
    money(revenue)
  );

  setText(
    ["grossProfit", "dashboardGrossProfit"],
    money(grossProfit)
  );

  setText(
    ["expenses", "expenseTotal", "dashboardExpenses"],
    money(expensesTotal)
  );

  setText(
    ["netProfit", "dashboardNetProfit"],
    money(netProfit)
  );

  setText(
    ["transactionCount", "transactionsCount"],
    sales.length
  );

  setText(
    ["productCount", "productsCount"],
    products.length
  );

  const lowStockCount = products.filter(function (p) {
    return (
      Number(p.stock) <=
      Number(p.lowStock || 5)
    );
  }).length;

  setText(
    ["lowStock", "lowStockCount"],
    lowStockCount
  );

  setText(
    ["customerCount", "customersCount"],
    getCustomers().length
  );

  renderRecentSales();
}

function renderRecentSales() {
  const box =
    document.getElementById("recentSales");

  if (!box) return;

  const recent = sales.slice(0, 5);

  if (!recent.length) {
    box.innerHTML =
      '<div class="empty">No recent sales.</div>';
    return;
  }

  box.innerHTML = recent
    .map(function (sale) {
      return `
        <div class="history-card">

          <strong>
            ${escapeHTML(
              sale.customerName ||
                "Walk-in Customer"
            )}
          </strong>

          <span>
            ${money(sale.total)}
          </span>

          <small>
            ${new Date(
              sale.date
            ).toLocaleString()}
          </small>

        </div>
      `;
    })
    .join("");
}

/* =========================================================
   REPORTS
   ========================================================= */

function renderReports() {
  setText(
    ["reportRevenue"],
    money(getRevenue())
  );

  setText(
    ["reportCost"],
    money(getCost())
  );

  setText(
    ["reportGrossProfit"],
    money(getGrossProfit())
  );

  setText(
    ["reportExpenses"],
    money(getExpenseTotal())
  );

  setText(
    ["reportNetProfit"],
    money(getNetProfit())
  );

  const bestSellerBox =
    document.getElementById("bestSellingProducts");

  if (!bestSellerBox) return;

  const counts = {};

  sales.forEach(function (sale) {
    (sale.items || []).forEach(function (item) {
      counts[item.name] =
        (counts[item.name] || 0) +
        Number(item.quantity || 0);
    });
  });

  const best = Object.entries(counts)
    .sort(function (a, b) {
      return b[1] - a[1];
    })
    .slice(0, 5);

  if (!best.length) {
    bestSellerBox.innerHTML =
      '<div class="empty">No sales data yet.</div>';
    return;
  }

  bestSellerBox.innerHTML = best
    .map(function (item) {
      return `
        <div class="history-card">
          <strong>
            ${escapeHTML(item[0])}
          </strong>

          <span>
            ${item[1]} sold
          </span>
        </div>
      `;
    })
    .join("");
}

/* =========================================================
   RECEIPT
   ========================================================= */

function showReceipt(sale) {
  const receipt =
    document.getElementById("receipt");

  if (!receipt) return;

  const items = (sale.items || [])
    .map(function (item) {
      return `
        <div class="receipt-line">
          <span>
            ${escapeHTML(item.name)}
            × ${item.quantity}
          </span>

          <strong>
            ${money(
              Number(item.price) *
                Number(item.quantity)
            )}
          </strong>
        </div>
      `;
    })
    .join("");

  receipt.innerHTML = `
    <h2>
      ${escapeHTML(
        storeSettings.storeName || "My Store"
      )}
    </h2>

    ${
      storeSettings.address
        ? `<p>${escapeHTML(
            storeSettings.address
          )}</p>`
        : ""
    }

    ${
      storeSettings.phone
        ? `<p>${escapeHTML(
            storeSettings.phone
          )}</p>`
        : ""
    }

    <hr>

    <strong>SALES RECEIPT</strong>

    <p>
      Customer:
      ${escapeHTML(
        sale.customerName || "Walk-in Customer"
      )}
    </p>

    <p>
      Payment:
      ${escapeHTML(
        sale.paymentMethod || "Cash"
      )}
    </p>

    <p>
      ${new Date(sale.date).toLocaleString()}
    </p>

    <hr>

    ${items}

    <hr>

    <div class="receipt-line">
      <strong>TOTAL</strong>
      <strong>${money(sale.total)}</strong>
    </div>

    <div class="receipt-line">
      <span>PAID</span>
      <span>${money(sale.paid)}</span>
    </div>

    <div class="receipt-line">
      <span>CHANGE</span>
      <span>${money(sale.change)}</span>
    </div>

    <p>
      Thank you for shopping with us ❤️
    </p>

    <button
      type="button"
      onclick="printReceipt()"
    >
      🖨 Print Receipt
    </button>
  `;

  receipt.style.display = "block";
}

window.printReceipt = function () {
  const receipt =
    document.getElementById("receipt");

  if (!receipt) return;

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("Please allow pop-ups to print.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt</title>

      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 400px;
          margin: auto;
          padding: 20px;
          color: #111;
        }

        .receipt-line {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin: 10px 0;
        }

        button {
          display: none !important;
        }

        h2,
        p {
          text-align: center;
        }
      </style>
    </head>

    <body>
      ${receipt.innerHTML}
    </body>
    </html>
  `);

  printWindow.document.close();

  setTimeout(function () {
    printWindow.print();
  }, 300);
};

/* =========================================================
   SETTINGS
   ========================================================= */

function loadSettingsForm() {
  setValue("storeName", storeSettings.storeName);
  setValue("ownerName", storeSettings.ownerName);
  setValue("storePhone", storeSettings.phone);
  setValue("storeEmail", storeSettings.email);
  setValue("storeAddress", storeSettings.address);
  setValue("storeCity", storeSettings.city);

  updateStoreTitle();
}

function saveSettings() {
  const name =
    getValue("storeName").trim();

  if (!name) {
    alert("Please enter your store name.");
    return;
  }

  storeSettings = {
    ...storeSettings,

    storeName: name,
    ownerName: getValue("ownerName").trim(),
    phone: getValue("storePhone").trim(),
    email: getValue("storeEmail").trim(),
    address: getValue("storeAddress").trim(),
    city: getValue("storeCity").trim()
  };

  saveStoreSettings();
  updateStoreTitle();

  alert("✅ Business information saved.");
}

function updateStoreTitle() {
  const title =
    document.getElementById("appStoreName");

  const letter =
    document.getElementById("profileLetter");

  const name =
    storeSettings.storeName || "My Store";

  if (title) {
    title.textContent = name;
  }

  if (letter) {
    letter.textContent =
      name.charAt(0).toUpperCase();
  }

  document.title = name + " POS";
}

/* =========================================================
   BACKUP / RESTORE
   ========================================================= */

window.backupData = function () {
  const backup = {
    version: 2,
    exportedAt: new Date().toISOString(),
    products,
    sales,
    expenses,
    storeSettings
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "my-store-pos-backup.json";

  link.click();

  URL.revokeObjectURL(url);
};

window.restoreData = function (file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    try {
      const backup = JSON.parse(
        event.target.result
      );

      if (!backup || !backup.version) {
        throw new Error("Invalid backup");
      }

      products = Array.isArray(backup.products)
        ? backup.products
        : [];

      sales = Array.isArray(backup.sales)
        ? backup.sales
        : [];

      expenses = Array.isArray(backup.expenses)
        ? backup.expenses
        : [];

      storeSettings = {
        ...storeSettings,
        ...(backup.storeSettings || {})
      };

      saveData();
      saveStoreSettings();

      location.reload();
    } catch (error) {
      alert("Invalid backup file.");
      console.error(error);
    }
  };

  reader.readAsText(file);
};

/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {
  const searches = [
    "productSearch",
    "inventorySearch",
    "homeProductSearch"
  ];

  searches.forEach(function (id) {
    const input =
      document.getElementById(id);

    if (!input) return;

    input.addEventListener(
      "input",
      function () {
        if (
          id === "inventorySearch"
        ) {
          renderInventory();
        } else {
          renderPOSProducts();
        }
      }
    );
  });
}

/* =========================================================
   GENERIC HELPERS
   ========================================================= */

function getValue(id) {
  const element =
    document.getElementById(id);

  return element
    ? element.value
    : "";
}

function setValue(id, value) {
  const element =
    document.getElementById(id);

  if (element) {
    element.value = value || "";
  }
}

function clearInput(id) {
  setValue(id, "");
}

function setText(ids, value) {
  ids.forEach(function (id) {
    const element =
      document.getElementById(id);

    if (element) {
      element.textContent = value;
    }
  });
}

/* =========================================================
   SERVICE WORKER
   ========================================================= */

if ("serviceWorker" in navigator) {
  window.addEventListener(
    "load",
    function () {
      navigator.serviceWorker
        .register("./sw.js")
        .then(function (registration) {
          console.log(
            "Service Worker registered:",
            registration.scope
          );
        })
        .catch(function (error) {
          console.error(
            "Service Worker registration failed:",
            error
          );
        });
    }
  );
}

/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {
    loadSettingsForm();

    setupSearch();

    renderInventory();
    renderPOSProducts();
    renderCart();

    renderDashboard();
    renderCustomers();
    renderSales();
    renderExpenses();
    renderReports();

    const saveButton =
      document.getElementById(
        "saveStoreButton"
      );

    if (saveButton) {
      saveButton.addEventListener(
        "click",
        saveSettings
      );
    }

    const amountPaid =
      document.getElementById(
        "amountPaid"
      );

    if (amountPaid) {
      amountPaid.addEventListener(
        "input",
        calculateChange
      );
    }

    const addExpenseButton =
      document.getElementById(
        "addExpenseButton"
      );

    if (addExpenseButton) {
      addExpenseButton.addEventListener(
        "click",
        window.addExpense
      );
    }

    const addProductButton =
      document.getElementById(
        "addProductButton"
      );

    if (addProductButton) {
      addProductButton.addEventListener(
        "click",
        function () {
          addProduct({
            name: getValue("productName"),
            category:
              getValue("productCategory"),
            sku: getValue("productSKU"),
            costPrice:
              getValue("productCostPrice"),
            retailPrice:
              getValue("productRetailPrice"),
            wholesalePrice:
              getValue(
                "productWholesalePrice"
              ),
            stock:
              getValue("productStock"),
            lowStock:
              getValue("productLowStock") || 5
          });

          clearInput("productName");
          clearInput("productCategory");
          clearInput("productSKU");
          clearInput("productCostPrice");
          clearInput("productRetailPrice");
          clearInput(
            "productWholesalePrice"
          );
          clearInput("productStock");
          clearInput("productLowStock");
        }
      );
    }

    console.log(
      "My Store POS V2 loaded successfully."
    );
  }
);
