/* =========================================================
   MY STORE POS — V2 SCRIPT
   ========================================================= */

"use strict";

/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE = {
  products: "posProducts",
  sales: "posSales",
  expenses: "posExpenses",
  customers: "posCustomers",
  settings: "posStoreSettings"
};

let products = load(STORAGE.products, []);
let sales = load(STORAGE.sales, []);
let expenses = load(STORAGE.expenses, []);
let customers = load(STORAGE.customers, []);

let storeSettings = load(STORAGE.settings, {
  storeName: "My Store",
  ownerName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  currency: "₦"
});

let cart = [];


/* =========================================================
   HELPERS
   ========================================================= */

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error("Storage error:", error);
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function money(value) {
  return (
    storeSettings.currency || "₦"
  ) + Number(value || 0).toLocaleString();
}

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function uid() {
  return Date.now() + Math.floor(Math.random() * 100000);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function todayStart() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function isToday(date) {
  return new Date(date) >= todayStart();
}

function getRevenue() {
  return sales.reduce(
    (sum, sale) => sum + number(sale.total),
    0
  );
}

function getCost() {
  return sales.reduce((sum, sale) => {
    return (
      sum +
      (sale.items || []).reduce((itemSum, item) => {
        return (
          itemSum +
          number(item.costPrice) *
            number(item.quantity)
        );
      }, 0)
    );
  }, 0);
}

function getGrossProfit() {
  return getRevenue() - getCost();
}

function getExpenseTotal() {
  return expenses.reduce(
    (sum, expense) =>
      sum + number(expense.amount),
    0
  );
}

function getNetProfit() {
  return getGrossProfit() - getExpenseTotal();
}

function getTodayRevenue() {
  return sales
    .filter(sale => isToday(sale.date))
    .reduce(
      (sum, sale) => sum + number(sale.total),
      0
    );
}

function getTodayExpenses() {
  return expenses
    .filter(expense => isToday(expense.date))
    .reduce(
      (sum, expense) =>
        sum + number(expense.amount),
      0
    );
}


/* =========================================================
   NAVIGATION
   ========================================================= */

window.openPage = function(pageId, button) {

  document
    .querySelectorAll(".page")
    .forEach(page => {
      page.classList.remove("active");
    });

  const page =
    document.getElementById(pageId);

  if (page) {
    page.classList.add("active");
  }

  document
    .querySelectorAll(
      ".side-item, .mobile-nav-item, .nav-item"
    )
    .forEach(item => {
      item.classList.remove("active");
    });

  if (button) {
    button.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  refreshPage(pageId);
};

function refreshPage(pageId) {

  switch (pageId) {

    case "homePage":
      updateDashboard();
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
      loadSettings();
      break;
  }
}


/* =========================================================
   PRODUCT FUNCTIONS
   ========================================================= */

function getProductById(id) {
  return products.find(
    product => String(product.id) === String(id)
  );
}

function productCategory(product) {
  return product.category || "General";
}

function renderInventory() {

  const container =
    document.getElementById("productList");

  if (!container) return;

  const search =
    (
      document.getElementById("inventorySearch")
        ?.value || ""
    )
      .toLowerCase()
      .trim();

  const filtered = products.filter(product => {

    return (
      product.name
        .toLowerCase()
        .includes(search) ||

      String(product.sku || "")
        .toLowerCase()
        .includes(search) ||

      productCategory(product)
        .toLowerCase()
        .includes(search)
    );
  });

  if (!filtered.length) {
    container.innerHTML =
      `<div class="empty">
        No products found.
      </div>`;
    updateDashboard();
    return;
  }

  container.innerHTML = filtered
    .map(product => {

      const stock =
        number(product.stock);

      let status = "In stock";

      if (stock <= 0) {
        status = "Out of stock";
      } else if (stock <= 5) {
        status = "Low stock";
      }

      return `
        <div class="product-card">

          <div class="product-top">

            <div>
              <div class="product-name">
                ${escapeHTML(product.name)}
              </div>

              <div class="product-price">
                ${escapeHTML(
                  productCategory(product)
                )}
              </div>

              ${
                product.sku
                  ? `
                    <small>
                      SKU: ${escapeHTML(product.sku)}
                    </small>
                  `
                  : ""
              }
            </div>

            <strong>
              ${stock}
            </strong>

          </div>

          <div>
            Cost:
            ${money(product.costPrice)}
          </div>

          <div>
            Retail:
            ${money(product.retailPrice)}
          </div>

          <div>
            Wholesale:
            ${money(product.wholesalePrice)}
          </div>

          <div class="stock">
            ${status}
          </div>

          <div class="product-actions">

            <button
              onclick="editProduct('${product.id}')"
            >
              Edit
            </button>

            <button
              onclick="deleteProduct('${product.id}')"
            >
              Delete
            </button>

          </div>

        </div>
      `;
    })
    .join("");

  updateDashboard();
}


/* =========================================================
   ADD PRODUCT
   ========================================================= */

window.showAddProduct = function() {

  const box =
    document.getElementById(
      "addProductBox"
    );

  if (!box) return;

  box.classList.toggle("hidden");
};

function addProduct() {

  const name =
    document.getElementById(
      "productName"
    )?.value.trim();

  const category =
    document.getElementById(
      "productCategory"
    )?.value.trim() || "General";

  const sku =
    document.getElementById(
      "productSKU"
    )?.value.trim() || "";

  const cost =
    number(
      document.getElementById(
        "productCostPrice"
      )?.value
    );

  const retail =
    number(
      document.getElementById(
        "productRetailPrice"
      )?.value
    );

  const wholesale =
    number(
      document.getElementById(
        "productWholesalePrice"
      )?.value
    );

  const stock =
    number(
      document.getElementById(
        "productStock"
      )?.value
    );

  if (!name) {
    alert("Enter product name.");
    return;
  }

  if (retail <= 0) {
    alert("Enter a valid selling price.");
    return;
  }

  if (stock < 0) {
    alert("Stock cannot be negative.");
    return;
  }

  products.push({
    id: uid(),
    name,
    category,
    sku,
    costPrice: cost,
    retailPrice: retail,
    wholesalePrice:
      wholesale || retail,
    stock,
    createdAt:
      new Date().toISOString()
  });

  save(STORAGE.products, products);

  clearProductForm();

  renderInventory();
  renderPOSProducts();
  updateDashboard();

  alert("Product added successfully.");
}

function clearProductForm() {

  [
    "productName",
    "productCategory",
    "productSKU",
    "productCostPrice",
    "productRetailPrice",
    "productWholesalePrice",
    "productStock"
  ].forEach(id => {

    const input =
      document.getElementById(id);

    if (input) {
      input.value = "";
    }
  });
}

window.deleteProduct = function(id) {

  const product =
    getProductById(id);

  if (!product) return;

  if (
    !confirm(
      `Delete "${product.name}"?`
    )
  ) {
    return;
  }

  products =
    products.filter(
      item =>
        String(item.id) !== String(id)
    );

  save(STORAGE.products, products);

  renderInventory();
  renderPOSProducts();
  updateDashboard();
};

window.editProduct = function(id) {

  const product =
    getProductById(id);

  if (!product) return;

  const name =
    prompt(
      "Product name:",
      product.name
    );

  if (name === null) return;

  const retail =
    prompt(
      "Retail price:",
      product.retailPrice
    );

  if (retail === null) return;

  const stock =
    prompt(
      "Stock quantity:",
      product.stock
    );

  if (stock === null) return;

  product.name = name.trim();
  product.retailPrice = number(retail);
  product.stock = number(stock);

  save(STORAGE.products, products);

  renderInventory();
  renderPOSProducts();
  updateDashboard();
};


/* =========================================================
   POS
   ========================================================= */

function renderPOSProducts() {

  const container =
    document.getElementById(
      "saleProducts"
    ) ||
    document.getElementById(
      "homeSaleProducts"
    );

  if (!container) return;

  const search =
    (
      document.getElementById(
        "productSearch"
      )?.value ||

      document.getElementById(
        "homeProductSearch"
      )?.value ||

      ""
    )
      .toLowerCase()
      .trim();

  const type =
    document.getElementById(
      "saleType"
    )?.value || "retail";

  const filtered =
    products.filter(product =>
      product.name
        .toLowerCase()
        .includes(search)
    );

  if (!filtered.length) {

    container.innerHTML =
      `<div class="empty">
        No products found.
      </div>`;

    return;
  }

  container.innerHTML =
    filtered.map(product => {

      const price =
        type === "wholesale"
          ? number(product.wholesalePrice)
          : number(product.retailPrice);

      const disabled =
        number(product.stock) <= 0;

      return `
        <div class="sale-product">

          <div class="sale-product-info">

            <strong>
              ${escapeHTML(product.name)}
            </strong>

            <small>
              ${money(price)}
              • Stock: ${product.stock}
            </small>

          </div>

          <button
            class="add-button"
            onclick="addToCart('${product.id}')"
            ${disabled ? "disabled" : ""}
          >
            ${
              disabled
                ? "Out of Stock"
                : "+ Add"
            }
          </button>

        </div>
      `;

    }).join("");
}

window.addToCart = function(id) {

  const product =
    getProductById(id);

  if (!product) return;

  if (number(product.stock) <= 0) {
    alert("This product is out of stock.");
    return;
  }

  const type =
    document.getElementById(
      "saleType"
    )?.value || "retail";

  const price =
    type === "wholesale"
      ? number(product.wholesalePrice)
      : number(product.retailPrice);

  const existing =
    cart.find(
      item =>
        String(item.productId) === String(id)
    );

  if (existing) {

    if (
      existing.quantity >=
      number(product.stock)
    ) {
      alert("Not enough stock.");
      return;
    }

    existing.quantity++;

  } else {

    cart.push({
      productId: product.id,
      name: product.name,
      costPrice:
        number(product.costPrice),
      price,
      quantity: 1,
      type
    });
  }

  renderCart();
};

function getCartSubtotal() {

  return cart.reduce(
    (sum, item) =>
      sum +
      number(item.price) *
      number(item.quantity),
    0
  );
}

function getDiscount() {

  return number(
    document.getElementById(
      "discount"
    )?.value
  );
}

function getCartTotal() {

  const subtotal =
    getCartSubtotal();

  const discount =
    getDiscount();

  return Math.max(
    0,
    subtotal - discount
  );
}

function renderCart() {

  const container =
    document.getElementById("cart");

  if (!container) return;

  if (!cart.length) {

    container.innerHTML =
      `<div class="empty">
        🛒 Cart is empty
      </div>`;

  } else {

    container.innerHTML =
      cart.map((item, index) => {

        const subtotal =
          number(item.price) *
          number(item.quantity);

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
              ${money(item.price)}
              × ${item.quantity}
            </small>

            <div class="quantity-controls">

              <button
                onclick="decreaseQuantity(${index})"
              >
                −
              </button>

              <span>
                ${item.quantity}
              </span>

              <button
                onclick="increaseQuantity(${index})"
              >
                +
              </button>

              <button
                onclick="removeFromCart(${index})"
              >
                Remove
              </button>

            </div>

          </div>
        `;

      }).join("");
  }

  const total =
    document.getElementById(
      "cartTotal"
    );

  if (total) {
    total.textContent =
      money(getCartTotal());
  }

  calculateChange();
}

window.increaseQuantity =
  function(index) {

    const item = cart[index];

    if (!item) return;

    const product =
      getProductById(
        item.productId
      );

    if (!product) return;

    if (
      item.quantity >=
      number(product.stock)
    ) {
      alert("Not enough stock.");
      return;
    }

    item.quantity++;

    renderCart();
  };

window.decreaseQuantity =
  function(index) {

    if (!cart[index]) return;

    if (cart[index].quantity > 1) {
      cart[index].quantity--;
    } else {
      cart.splice(index, 1);
    }

    renderCart();
  };

window.removeFromCart =
  function(index) {

    cart.splice(index, 1);

    renderCart();
  };


/* =========================================================
   PAYMENT
   ========================================================= */

function calculateChange() {

  const display =
    document.getElementById(
      "changeDisplay"
    );

  if (!display) return;

  const total =
    getCartTotal();

  const paid =
    number(
      document.getElementById(
        "amountPaid"
      )?.value
    );

  if (!total || !paid) {
    display.innerHTML = "";
    return;
  }

  if (paid < total) {

    display.innerHTML =
      `<strong>
        Amount remaining:
        ${money(total - paid)}
      </strong>`;

  } else {

    display.innerHTML =
      `<strong>
        Change:
        ${money(paid - total)}
      </strong>`;
  }
}


/* =========================================================
   COMPLETE SALE
   ========================================================= */

function completeSale() {

  if (!cart.length) {
    alert("Cart is empty.");
    return;
  }

  const customerName =
    document.getElementById(
      "customerName"
    )?.value.trim() ||
    "Walk-in Customer";

  const customerPhone =
    document.getElementById(
      "customerPhone"
    )?.value.trim() ||
    "";

  const paid =
    number(
      document.getElementById(
        "amountPaid"
      )?.value
    );

  const paymentMethod =
    document.getElementById(
      "paymentMethod"
    )?.value ||
    "Cash";

  const discount =
    getDiscount();

  const subtotal =
    getCartSubtotal();

  const total =
    getCartTotal();

  if (paid < total) {
    alert(
      "Amount paid is not enough."
    );
    return;
  }

  const change =
    paid - total;

  cart.forEach(item => {

    const product =
      getProductById(
        item.productId
      );

    if (product) {
      product.stock =
        Math.max(
          0,
          number(product.stock) -
          number(item.quantity)
        );
    }
  });

  const sale = {

    id: uid(),

    date:
      new Date().toISOString(),

    customerName,

    customerPhone,

    paymentMethod,

    items:
      cart.map(item => ({
        productId:
          item.productId,

        name:
          item.name,

        costPrice:
          number(item.costPrice),

        price:
          number(item.price),

        quantity:
          number(item.quantity),

        type:
          item.type
      })),

    subtotal,

    discount,

    total,

    paid,

    change
  };

  sales.unshift(sale);

  updateCustomer(
    customerName,
    customerPhone,
    total
  );

  save(
    STORAGE.products,
    products
  );

  save(
    STORAGE.sales,
    sales
  );

  save(
    STORAGE.customers,
    customers
  );

  showReceipt(sale);

  cart = [];

  [
    "customerName",
    "customerPhone",
    "amountPaid",
    "discount"
  ].forEach(id => {

    const input =
      document.getElementById(id);

    if (input) {
      input.value = "";
    }
  });

  renderCart();
  renderInventory();
  renderPOSProducts();
  renderCustomers();
  renderSales();
  updateDashboard();
  renderReports();

  alert(
    "✅ Sale completed successfully."
  );
}


/* =========================================================
   CUSTOMERS
   ========================================================= */

function updateCustomer(
  name,
  phone,
  amount
) {

  if (!name || name === "Walk-in Customer") {
    return;
  }

  let customer =
    customers.find(item =>
      phone
        ? item.phone === phone
        : item.name === name
    );

  if (!customer) {

    customer = {
      id: uid(),
      name,
      phone,
      totalSpent: 0,
      purchases: 0
    };

    customers.push(customer);
  }

  customer.totalSpent =
    number(customer.totalSpent) +
    number(amount);

  customer.purchases =
    number(customer.purchases) + 1;
}

function renderCustomers() {

  const container =
    document.getElementById(
      "customerList"
    );

  if (!container) return;

  if (!customers.length) {

    container.innerHTML =
      `<div class="empty">
        No customers yet.
      </div>`;

    return;
  }

  container.innerHTML =
    customers.map(customer => {

      const history =
        sales.filter(sale =>
          customer.phone
            ? sale.customerPhone ===
              customer.phone
            : sale.customerName ===
              customer.name
        );

      return `
        <div class="history-card">

          <h3>
            👤 ${escapeHTML(customer.name)}
          </h3>

          <p>
            ${escapeHTML(
              customer.phone || "No phone"
            )}
          </p>

          <p>
            Purchases:
            ${history.length}
          </p>

          <strong>
            Total spent:
            ${money(customer.totalSpent)}
          </strong>

        </div>
      `;

    }).join("");
}


/* =========================================================
   SALES
   ========================================================= */

function renderSales() {

  const container =
    document.getElementById(
      "salesHistory"
    );

  if (!container) return;

  if (!sales.length) {

    container.innerHTML =
      `<div class="empty">
        No sales yet.
      </div>`;

    return;
  }

  container.innerHTML =
    sales.map(sale => {

      const items =
        (sale.items || [])
          .map(item =>
            `${escapeHTML(item.name)}
             × ${item.quantity}
             — ${money(
               item.price *
               item.quantity
             )}`
          )
          .join("<br>");

      return `
        <div class="history-card">

          <strong>
            🧾 Sale #${sale.id}
          </strong>

          <p>
            ${new Date(
              sale.date
            ).toLocaleString()}
          </p>

          <p>
            Customer:
            ${escapeHTML(
              sale.customerName
            )}
          </p>

          <p>
            Payment:
            ${escapeHTML(
              sale.paymentMethod
            )}
          </p>

          <div>
            ${items}
          </div>

          <hr>

          <strong>
            Total:
            ${money(sale.total)}
          </strong>

          <br>

          Paid:
          ${money(sale.paid)}

          <br>

          Change:
          ${money(sale.change)}

        </div>
      `;

    }).join("");
}


/* =========================================================
   EXPENSES
   ========================================================= */

function addExpense() {

  const category =
    document.getElementById(
      "expenseCategory"
    )?.value.trim() ||
    "Other";

  const amount =
    number(
      document.getElementById(
        "expenseAmount"
      )?.value
    );

  const notes =
    document.getElementById(
      "expenseNotes"
    )?.value.trim() ||
    "";

  const date =
    document.getElementById(
      "expenseDate"
    )?.value ||
    new Date()
      .toISOString()
      .split("T")[0];

  if (amount <= 0) {
    alert("Enter a valid expense amount.");
    return;
  }

  expenses.unshift({

    id: uid(),

    category,

    amount,

    date:
      new Date(date).toISOString(),

    notes
  });

  save(
    STORAGE.expenses,
    expenses
  );

  [
    "expenseAmount",
    "expenseNotes"
  ].forEach(id => {

    const input =
      document.getElementById(id);

    if (input) {
      input.value = "";
    }
  });

  renderExpenses();
  renderReports();
  updateDashboard();

  alert("Expense added.");
}

function renderExpenses() {

  const container =
    document.getElementById(
      "expenseList"
    );

  if (!container) return;

  if (!expenses.length) {

    container.innerHTML =
      `<div class="empty">
        No expenses yet.
      </div>`;

    return;
  }

  container.innerHTML =
    expenses.map(expense => {

      return `
        <div class="history-card">

          <strong>
            ${escapeHTML(
              expense.category
            )}
          </strong>

          <h3>
            ${money(expense.amount)}
          </h3>

          <p>
            ${new Date(
              expense.date
            ).toLocaleDateString()}
          </p>

          ${
            expense.notes
              ? `
                <p>
                  ${escapeHTML(
                    expense.notes
                  )}
                </p>
              `
              : ""
          }

          <button
            onclick="deleteExpense('${expense.id}')"
          >
            Delete
          </button>

        </div>
      `;

    }).join("");
}

window.deleteExpense =
  function(id) {

    expenses =
      expenses.filter(
        expense =>
          String(expense.id) !== String(id)
      );

    save(
      STORAGE.expenses,
      expenses
    );

    renderExpenses();
    renderReports();
    updateDashboard();
  };


/* =========================================================
   REPORTS
   ========================================================= */

function renderReports() {

  const revenue =
    getRevenue();

  const cost =
    getCost();

  const gross =
    getGrossProfit();

  const expenseTotal =
    getExpenseTotal();

  const net =
    getNetProfit();

  const map = {

    reportRevenue: revenue,

    reportCost: cost,

    reportGrossProfit: gross,

    reportExpenses: expenseTotal,

    reportNetProfit: net
  };

  Object.keys(map).forEach(id => {

    const element =
      document.getElementById(id);

    if (element) {
      element.textContent =
        money(map[id]);
    }
  });

  renderBestSellingProducts();
}

function renderBestSellingProducts() {

  const container =
    document.getElementById(
      "bestSellingProducts"
    );

  if (!container) return;

  const totals = {};

  sales.forEach(sale => {

    (sale.items || [])
      .forEach(item => {

        if (!totals[item.name]) {
          totals[item.name] = 0;
        }

        totals[item.name] +=
          number(item.quantity);
      });
  });

  const sorted =
    Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

  if (!sorted.length) {

    container.innerHTML =
      `<div class="empty">
        No sales data yet.
      </div>`;

    return;
  }

  container.innerHTML =
    sorted.map(
      ([name, quantity], index) => `
        <div class="history-card">

          <strong>
            #${index + 1}
            ${escapeHTML(name)}
          </strong>

          <p>
            ${quantity} units sold
          </p>

        </div>
      `
    ).join("");
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

  const values = {

    revenue:
      getTodayRevenue(),

    grossProfit:
      getGrossProfit(),

    expenses:
      getTodayExpenses(),

    netProfit:
      getNetProfit(),

    transactions:
      sales.length,

    products:
      products.length,

    lowStock:
      products.filter(
        product =>
          number(product.stock) <= 5
      ).length
  };

  const ids = {

    revenue:
      "revenue",

    grossProfit:
      "grossProfit",

    expenses:
      "expenses",

    netProfit:
      "netProfit",

    transactions:
      "transactionCount",

    products:
      "productCount",

    lowStock:
      "lowStock"
  };

  Object.keys(ids).forEach(key => {

    const element =
      document.getElementById(
        ids[key]
      );

    if (!element) return;

    if (
      [
        "transactions",
        "products",
        "lowStock"
      ].includes(key)
    ) {
      element.textContent =
        values[key];
    } else {
      element.textContent =
        money(values[key]);
    }
  });

  renderRecentSales();
}

function renderRecentSales() {

  const container =
    document.getElementById(
      "recentSales"
    );

  if (!container) return;

  const recent =
    sales.slice(0, 5);

  if (!recent.length) {

    container.innerHTML =
      `<div class="empty">
        No recent sales.
      </div>`;

    return;
  }

  container.innerHTML =
    recent.map(sale => {

      return `
        <div class="history-card">

          <strong>
            ${escapeHTML(
              sale.customerName
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

    }).join("");
}


/* =========================================================
   SETTINGS
   ========================================================= */

function loadSettings() {

  const fields = {

    storeName:
      storeSettings.storeName,

    ownerName:
      storeSettings.ownerName,

    storePhone:
      storeSettings.phone,

    storeEmail:
      storeSettings.email,

    storeAddress:
      storeSettings.address,

    storeCity:
      storeSettings.city
  };

  Object.keys(fields).forEach(id => {

    const input =
      document.getElementById(id);

    if (input) {
      input.value =
        fields[id] || "";
    }
  });

  updateStoreTitle();
}

function saveSettings() {

  storeSettings = {

    storeName:
      document.getElementById(
        "storeName"
      )?.value.trim() ||
      "My Store",

    ownerName:
      document.getElementById(
        "ownerName"
      )?.value.trim() ||
      "",

    phone:
      document.getElementById(
        "storePhone"
      )?.value.trim() ||
      "",

    email:
      document.getElementById(
        "storeEmail"
      )?.value.trim() ||
      "",

    address:
      document.getElementById(
        "storeAddress"
      )?.value.trim() ||
      "",

    city:
      document.getElementById(
        "storeCity"
      )?.value.trim() ||
      "",

    currency:
      storeSettings.currency || "₦"
  };

  save(
    STORAGE.settings,
    storeSettings
  );

  updateStoreTitle();

  alert(
    "Business information saved."
  );
}

function updateStoreTitle() {

  const name =
    storeSettings.storeName ||
    "My Store";

  const title =
    document.getElementById(
      "appStoreName"
    );

  if (title) {
    title.textContent = name;
  }

  const letter =
    document.getElementById(
      "profileLetter"
    );

  if (letter) {
    letter.textContent =
      name.charAt(0).toUpperCase();
  }

  document.title =
    name + " POS";
}


/* =========================================================
   RECEIPT
   ========================================================= */

function showReceipt(sale) {

  const receipt =
    document.getElementById(
      "receipt"
    );

  if (!receipt) return;

  const items =
    (sale.items || [])
      .map(item => {

        return `
          <div class="receipt-line">

            <span>
              ${escapeHTML(item.name)}
              × ${item.quantity}
            </span>

            <span>
              ${money(
                item.price *
                item.quantity
              )}
            </span>

          </div>
        `;

      }).join("");

  receipt.innerHTML = `

    <h2>
      ${escapeHTML(
        storeSettings.storeName
      )}
    </h2>

    ${
      storeSettings.address
        ? `<p>
            ${escapeHTML(
              storeSettings.address
            )}
          </p>`
        : ""
    }

    ${
      storeSettings.phone
        ? `<p>
            ${escapeHTML(
              storeSettings.phone
            )}
          </p>`
        : ""
    }

    <hr>

    <h3>
      SALES RECEIPT
    </h3>

    <p>
      Customer:
      ${escapeHTML(
        sale.customerName
      )}
    </p>

    <p>
      Payment:
      ${escapeHTML(
        sale.paymentMethod
      )}
    </p>

    <p>
      ${new Date(
        sale.date
      ).toLocaleString()}
    </p>

    <hr>

    ${items}

    <hr>

    <div class="receipt-line">
      <strong>TOTAL</strong>
      <strong>
        ${money(sale.total)}
      </strong>
    </div>

    <div class="receipt-line">
      <span>Paid</span>
      <span>
        ${money(sale.paid)}
      </span>
    </div>

    <div class="receipt-line">
      <span>Change</span>
      <span>
        ${money(sale.change)}
      </span>
    </div>

    <p>
      Thank you for shopping with us ❤️
    </p>

    <button
      onclick="printReceipt()"
    >
      🖨️ Print Receipt
    </button>
  `;

  receipt.style.display = "block";
}

window.printReceipt =
  function() {

    const receipt =
      document.getElementById(
        "receipt"
      );

    if (!receipt) return;

    const printWindow =
      window.open(
        "",
        "_blank"
      );

    if (!printWindow) {
      alert(
        "Please allow pop-ups."
      );
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>

      <head>

        <title>
          Receipt
        </title>

        <style>

          body {
            font-family: Arial, sans-serif;
            max-width: 400px;
            margin: auto;
            padding: 20px;
          }

          .receipt-line {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin: 8px 0;
          }

          button {
            display: none;
          }

          h2,
          h3,
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

    setTimeout(() => {
      printWindow.print();
    }, 300);
  };


/* =========================================================
   BACKUP
   ========================================================= */

window.exportData = function() {

  const backup = {

    version: "2.0",

    exportedAt:
      new Date().toISOString(),

    products,

    sales,

    expenses,

    customers,

    storeSettings
  };

  const blob =
    new Blob(
      [
        JSON.stringify(
          backup,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    "my-store-pos-backup.json";

  link.click();

  URL.revokeObjectURL(url);
};

window.importData =
  function(input) {

    const file =
      input.files?.[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = event => {

      try {

        const data =
          JSON.parse(
            event.target.result
          );

        if (data.products) {
          products =
            data.products;
        }

        if (data.sales) {
          sales =
            data.sales;
        }

        if (data.expenses) {
          expenses =
            data.expenses;
        }

        if (data.customers) {
          customers =
            data.customers;
        }

        if (data.storeSettings) {
          storeSettings =
            data.storeSettings;
        }

        save(
          STORAGE.products,
          products
        );

        save(
          STORAGE.sales,
          sales
        );

        save(
          STORAGE.expenses,
          expenses
        );

        save(
          STORAGE.customers,
          customers
        );

        save(
          STORAGE.settings,
          storeSettings
        );

        location.reload();

      } catch (error) {

        alert(
          "Invalid backup file."
        );
      }
    };

    reader.readAsText(file);
  };


/* =========================================================
   EVENT CONNECTIONS
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /* Product */
    document
      .getElementById(
        "addProductButton"
      )
      ?.addEventListener(
        "click",
        addProduct
      );

    document
      .getElementById(
        "productSearch"
      )
      ?.addEventListener(
        "input",
        renderPOSProducts
      );

    document
      .getElementById(
        "inventorySearch"
      )
      ?.addEventListener(
        "input",
        renderInventory
      );

    document
      .getElementById(
        "saleType"
      )
      ?.addEventListener(
        "change",
        renderPOSProducts
      );

    /* Discount */

    document
      .getElementById(
        "discount"
      )
      ?.addEventListener(
        "input",
        renderCart
      );

    /* Payment */

    document
      .getElementById(
        "amountPaid"
      )
      ?.addEventListener(
        "input",
        calculateChange
      );

    /* Complete sale */

    document
      .getElementById(
        "completeSaleButton"
      )
      ?.addEventListener(
        "click",
        completeSale
      );

    /* Save settings */

    document
      .getElementById(
        "saveStoreButton"
      )
      ?.addEventListener(
        "click",
        saveSettings
      );

    /* Expense */

    document
      .getElementById(
        "addExpenseButton"
      )
      ?.addEventListener(
        "click",
        addExpense
      );

    /* Initial rendering */

    loadSettings();

    renderInventory();

    renderPOSProducts();

    renderCart();

    renderCustomers();

    renderSales();

    renderExpenses();

    renderReports();

    updateDashboard();

  }
);
