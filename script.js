/* =========================================================
   MY STORE POS — V2 SCRIPT
   Works with the V2 index.html
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
  receiptFooter: "Thank you for shopping with us!",
  defaultSaleType: "retail"
};


/* =========================================================
   STORAGE HELPERS
========================================================= */

function loadJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error("Storage error:", key, error);
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Could not save:", key, error);
  }
}

function loadAllData() {
  products = loadJSON("posProducts", []);
  sales = loadJSON("posSales", []);
  expenses = loadJSON("posExpenses", []);

  const savedSettings =
    loadJSON("posStoreSettings", null);

  if (savedSettings) {
    storeSettings = {
      ...storeSettings,
      ...savedSettings
    };
  }
}

function saveAllData() {
  saveJSON("posProducts", products);
  saveJSON("posSales", sales);
  saveJSON("posExpenses", expenses);
  saveJSON("posStoreSettings", storeSettings);
}


/* =========================================================
   HELPERS
========================================================= */

function money(value) {
  return "₦" + Number(value || 0).toLocaleString();
}

function todayString() {
  return new Date().toDateString();
}

function isToday(date) {
  return new Date(date).toDateString() === todayString();
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getProductCost(product) {
  return Number(product.costPrice || 0);
}

function getSaleCost(sale) {
  return (sale.items || []).reduce(function(total, item) {
    return total +
      Number(item.costPrice || 0) *
      Number(item.quantity || 0);
  }, 0);
}

function getSaleProfit(sale) {
  return Number(sale.total || 0) - getSaleCost(sale);
}

function getTodayRevenue() {
  return sales
    .filter(sale => isToday(sale.date))
    .reduce((total, sale) => {
      return total + Number(sale.total || 0);
    }, 0);
}

function getTodayCost() {
  return sales
    .filter(sale => isToday(sale.date))
    .reduce((total, sale) => {
      return total + getSaleCost(sale);
    }, 0);
}

function getTodayExpenses() {
  return expenses
    .filter(expense => {
      const date = expense.date
        ? new Date(expense.date + "T00:00:00")
        : new Date(expense.createdAt);

      return date.toDateString() === todayString();
    })
    .reduce((total, expense) => {
      return total + Number(expense.amount || 0);
    }, 0);
}


/* =========================================================
   NAVIGATION
========================================================= */

window.openPage = function(pageId, clickedButton) {

  document.querySelectorAll(".page").forEach(function(page) {
    page.classList.remove("active");
  });

  const page = document.getElementById(pageId);

  if (!page) return;

  page.classList.add("active");

  document
    .querySelectorAll(".side-item, .mobile-nav-item")
    .forEach(function(button) {
      button.classList.remove("active");
    });

  const titleMap = {
    homePage: "Dashboard",
    posPage: "Point of Sale",
    inventoryPage: "Inventory",
    customersPage: "Customers",
    salesPage: "Sales History",
    expensesPage: "Expenses",
    reportsPage: "Reports",
    settingsPage: "Settings"
  };

  const title = document.getElementById("pageTitle");

  if (title) {
    title.textContent =
      titleMap[pageId] || "Dashboard";
  }

  if (clickedButton) {
    clickedButton.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (pageId === "homePage") {
    renderDashboard();
  }

  if (pageId === "posPage") {
    renderSaleProducts();
    renderCart();
  }

  if (pageId === "inventoryPage") {
    showProducts();
  }

  if (pageId === "salesPage") {
    showSalesHistory();
    showTodaySales();
  }

  if (pageId === "expensesPage") {
    showExpenses();
  }

  if (pageId === "reportsPage") {
    renderReports();
  }
};


/* =========================================================
   STORE SETTINGS
========================================================= */

function updateStoreTitle() {

  const title =
    document.getElementById("appStoreName");

  const letter =
    document.getElementById("profileLetter");

  const profileName =
    document.querySelector(".sidebar-profile strong");

  const name =
    storeSettings.storeName || "My Store";

  if (title) {
    title.textContent = name;
  }

  if (letter) {
    letter.textContent =
      name.charAt(0).toUpperCase();
  }

  if (profileName) {
    profileName.textContent = name;
  }

  document.title = name + " POS";
}

function loadStoreSettings() {

  const fields = {
    storeName: storeSettings.storeName,
    ownerName: storeSettings.ownerName,
    storePhone: storeSettings.phone,
    storeEmail: storeSettings.email,
    storeAddress: storeSettings.address,
    storeCity: storeSettings.city,
    receiptFooter: storeSettings.receiptFooter,
    defaultSaleType: storeSettings.defaultSaleType
  };

  Object.keys(fields).forEach(function(id) {

    const element =
      document.getElementById(id);

    if (element) {
      element.value =
        fields[id] || "";
    }
  });

  updateStoreTitle();
}

function setupSettings() {

  const saveButton =
    document.getElementById("saveStoreButton");

  if (!saveButton) return;

  saveButton.addEventListener("click", function() {

    const storeName =
      document.getElementById("storeName");

    if (!storeName || !storeName.value.trim()) {
      alert("Please enter a business name.");
      return;
    }

    storeSettings.storeName =
      storeName.value.trim();

    storeSettings.ownerName =
      document.getElementById("ownerName")?.value.trim() || "";

    storeSettings.phone =
      document.getElementById("storePhone")?.value.trim() || "";

    storeSettings.email =
      document.getElementById("storeEmail")?.value.trim() || "";

    storeSettings.address =
      document.getElementById("storeAddress")?.value.trim() || "";

    storeSettings.city =
      document.getElementById("storeCity")?.value.trim() || "";

    storeSettings.receiptFooter =
      document.getElementById("receiptFooter")?.value.trim() ||
      "Thank you for shopping with us!";

    storeSettings.defaultSaleType =
      document.getElementById("defaultSaleType")?.value ||
      "retail";

    saveAllData();
    updateStoreTitle();

    const message =
      document.getElementById("storeSaveMessage");

    if (message) {
      message.textContent =
        "✅ Business information saved.";

      setTimeout(function() {
        message.textContent = "";
      }, 3000);
    }

    alert("Business information saved.");
  });
}


/* =========================================================
   PRODUCTS
========================================================= */

function setupProductForm() {

  const button =
    document.getElementById("addProductButton");

  if (!button) return;

  button.addEventListener("click", function() {

    const name =
      document.getElementById("productName")?.value.trim();

    const sku =
      document.getElementById("productSKU")?.value.trim();

    const category =
      document.getElementById("productCategory")?.value.trim();

    const costPrice =
      Number(
        document.getElementById("productCostPrice")?.value
      );

    const retailPrice =
      Number(
        document.getElementById("productRetailPrice")?.value
      );

    const wholesalePrice =
      Number(
        document.getElementById("productWholesalePrice")?.value
      );

    const stock =
      Number(
        document.getElementById("productStock")?.value
      );

    if (!name) {
      alert("Please enter product name.");
      return;
    }

    if (retailPrice <= 0) {
      alert("Please enter a valid retail price.");
      return;
    }

    if (wholesalePrice <= 0) {
      alert("Please enter a valid wholesale price.");
      return;
    }

    if (isNaN(stock) || stock < 0) {
      alert("Please enter a valid stock quantity.");
      return;
    }

    if (products.some(function(product) {
      return sku &&
        String(product.sku || "").toLowerCase() ===
        sku.toLowerCase();
    })) {
      alert("That SKU already exists.");
      return;
    }

    products.push({
      id: Date.now(),
      name: name,
      sku: sku,
      category: category,
      costPrice: costPrice || 0,
      retailPrice: retailPrice,
      wholesalePrice: wholesalePrice,
      stock: stock,
      createdAt: new Date().toISOString()
    });

    saveAllData();

    [
      "productName",
      "productSKU",
      "productCategory",
      "productCostPrice",
      "productRetailPrice",
      "productWholesalePrice",
      "productStock"
    ].forEach(function(id) {
      const input = document.getElementById(id);
      if (input) input.value = "";
    });

    showProducts();
    renderSaleProducts();
    renderDashboard();

    alert("✅ Product added successfully.");
  });
}

function productHTML(product, index) {

  const stock =
    Number(product.stock || 0);

  let stockClass = "good";
  let stockText = "🟢 In stock";

  if (stock <= 0) {
    stockClass = "low";
    stockText = "🔴 Out of stock";
  } else if (stock <= 5) {
    stockClass = "low";
    stockText = "🟠 Low stock";
  }

  return `
    <div class="product-card">

      <div class="product-top">

        <div>

          <div class="product-name">
            ${escapeHTML(product.name)}
          </div>

          ${
            product.category
              ? `<small>Category: ${escapeHTML(product.category)}</small>`
              : ""
          }

          ${
            product.sku
              ? `<small>SKU: ${escapeHTML(product.sku)}</small>`
              : ""
          }

          <div class="product-price">
            Cost: ${money(product.costPrice)}
          </div>

          <div class="product-price">
            Retail: ${money(product.retailPrice)}
          </div>

          <div class="product-price">
            Wholesale: ${money(product.wholesalePrice)}
          </div>

        </div>

        <strong>
          ${stock}
        </strong>

      </div>

      <div class="stock ${stockClass}">
        ${stockText}
      </div>

      <br>

      <button
        onclick="deleteProduct(${index})"
        style="
          background:#dc2626;
          color:white;
          border:0;
          padding:9px 12px;
          border-radius:8px;
          cursor:pointer;
        "
      >
        🗑️ Delete
      </button>

    </div>
  `;
}

function showProducts(listData) {

  const list =
    document.getElementById("productList");

  if (!list) return;

  const data =
    Array.isArray(listData)
      ? listData
      : products;

  if (data.length === 0) {

    list.innerHTML =
      '<p class="empty">No products added yet.</p>';

    return;
  }

  list.innerHTML =
    data.map(function(product) {

      const index =
        products.indexOf(product);

      return productHTML(
        product,
        index
      );

    }).join("");
}

window.deleteProduct = function(index) {

  const product = products[index];

  if (!product) return;

  if (!confirm(`Delete "${product.name}"?`)) {
    return;
  }

  products.splice(index, 1);

  cart = cart.filter(function(item) {
    return item.index !== index;
  });

  saveAllData();

  showProducts();
  renderSaleProducts();
  renderCart();
  renderDashboard();
};


/* =========================================================
   ADD PRODUCT BOX
========================================================= */

window.showAddProduct = function () {
  const box = document.getElementById("addProductBox");

  if (!box) return;

  box.classList.toggle("hidden");
};

  if (!box.classList.contains("hidden")) {
    box.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
};


/* =========================================================
   POS PRODUCTS
========================================================= */

function getSaleType() {

  const select =
    document.getElementById("saleType");

  return select
    ? select.value
    : storeSettings.defaultSaleType || "retail";
}

function renderSaleProducts() {

  const box =
    document.getElementById("saleProducts");

  if (!box) return;

  const search =
    document.getElementById("productSearch")
      ?.value.trim().toLowerCase() || "";

  const type =
    getSaleType();

  const results =
    products.filter(function(product) {

      return (
        product.name.toLowerCase().includes(search) ||
        String(product.sku || "")
          .toLowerCase()
          .includes(search) ||
        String(product.category || "")
          .toLowerCase()
          .includes(search)
      );

    });

  if (results.length === 0) {

    box.innerHTML =
      '<p class="empty">No matching products found.</p>';

    return;
  }

  box.innerHTML =
    results.map(function(product) {

      const index =
        products.indexOf(product);

      const price =
        type === "wholesale"
          ? Number(product.wholesalePrice || 0)
          : Number(product.retailPrice || 0);

      const outOfStock =
        Number(product.stock) <= 0;

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

            ${
              product.category
                ? `<small>${escapeHTML(product.category)}</small>`
                : ""
            }

          </div>

          <button
            class="add-button"
            onclick="addToCart(${index})"
            ${outOfStock ? "disabled" : ""}
          >
            ${outOfStock ? "Out of Stock" : "+ Add"}
          </button>

        </div>
      `;

    }).join("");
}

window.addToCart = function(index) {

  const product = products[index];

  if (!product) return;

  if (Number(product.stock) <= 0) {
    alert("This product is out of stock.");
    return;
  }

  addProductToCart(index, getSaleType());
};

function addProductToCart(index, type) {

  const product =
    products[index];

  if (!product) return;

  const price =
    type === "wholesale"
      ? Number(product.wholesalePrice || 0)
      : Number(product.retailPrice || 0);

  const existing =
    cart.find(function(item) {
      return (
        item.productId === product.id &&
        item.type === type
      );
    });

  if (existing) {

    if (
      existing.quantity >=
      Number(product.stock)
    ) {
      alert("Not enough stock.");
      return;
    }

    existing.quantity++;

  } else {

    cart.push({
      productId: product.id,
      index: index,
      name: product.name,
      price: price,
      costPrice: Number(product.costPrice || 0),
      quantity: 1,
      type: type,
      discount: 0
    });
  }

  renderCart();
}


/* =========================================================
   CART
========================================================= */

function getCartSubtotal() {

  return cart.reduce(function(total, item) {

    return total +
      Number(item.price) *
      Number(item.quantity);

  }, 0);
}

function getCartDiscount() {

  return cart.reduce(function(total, item) {

    return total +
      Number(item.discount || 0);

  }, 0);
}

function getCartTotal() {

  return Math.max(
    0,
    getCartSubtotal() -
    getCartDiscount()
  );
}

function renderCart() {

  const box =
    document.getElementById("cart");

  if (!box) return;

  if (cart.length === 0) {

    box.innerHTML =
      '<p class="empty">Cart is empty.</p>';

  } else {

    box.innerHTML =
      cart.map(function(item, index) {

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
              ${item.type === "wholesale"
                ? "Wholesale"
                : "Retail"}
              • ${money(item.price)}
            </small>

            <div class="quantity-controls">

              <button
                onclick="decreaseQuantity(${index})"
              >
                −
              </button>

              <button>
                ${item.quantity}
              </button>

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

            <div style="margin-top:8px;">
              <input
                type="number"
                min="0"
                value="${Number(item.discount || 0)}"
                placeholder="Discount"
                onchange="setItemDiscount(${index}, this.value)"
                style="width:100%;"
              >
            </div>

          </div>
        `;

      }).join("");
  }

  const total =
    document.getElementById("cartTotal");

  if (total) {
    total.textContent =
      money(getCartTotal());
  }

  calculateChange();
}

window.setItemDiscount = function(index, value) {

  const item = cart[index];

  if (!item) return;

  let discount = Number(value || 0);

  const maximum =
    Number(item.price) *
    Number(item.quantity);

  if (discount < 0) discount = 0;

  if (discount > maximum) {
    discount = maximum;
  }

  item.discount = discount;

  renderCart();
};

window.increaseQuantity = function(index) {

  const item = cart[index];

  if (!item) return;

  const product =
    products.find(function(p) {
      return p.id === item.productId;
    });

  if (!product) return;

  if (
    item.quantity >=
    Number(product.stock)
  ) {
    alert("Not enough stock.");
    return;
  }

  item.quantity++;

  renderCart();
};

window.decreaseQuantity = function(index) {

  const item = cart[index];

  if (!item) return;

  if (item.quantity > 1) {
    item.quantity--;
  } else {
    cart.splice(index, 1);
  }

  renderCart();
};

window.removeFromCart = function(index) {

  if (!cart[index]) return;

  cart.splice(index, 1);

  renderCart();
};


/* =========================================================
   PAYMENT
========================================================= */

function calculateChange() {

  const display =
    document.getElementById("changeDisplay");

  if (!display) return;

  const total =
    getCartTotal();

  const paid =
    Number(
      document.getElementById("amountPaid")?.value || 0
    );

  if (!total || !paid) {
    display.innerHTML = "";
    return;
  }

  if (paid < total) {

    display.innerHTML = `
      <strong style="color:#dc2626;">
        Amount remaining:
        ${money(total - paid)}
      </strong>
    `;

  } else {

    display.innerHTML = `
      <strong style="color:#168344;">
        Change:
        ${money(paid - total)}
      </strong>
    `;
  }
}


/* =========================================================
   COMPLETE SALE
========================================================= */

function setupCompleteSale() {

  const button =
    document.getElementById("completeSaleButton");

  if (!button) return;

  button.addEventListener("click", function() {

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const customerName =
      document.getElementById("customerName")
        ?.value.trim();

    const customerPhone =
      document.getElementById("customerPhone")
        ?.value.trim();

    if (!customerName) {
      alert("Please enter customer name.");
      return;
    }

    if (!customerPhone) {
      alert("Please enter customer phone.");
      return;
    }

    const total =
      getCartTotal();

    const paid =
      Number(
        document.getElementById("amountPaid")?.value || 0
      );

    if (paid < total) {
      alert(
        "Amount paid is not enough.\n\n" +
        "Total: " + money(total)
      );
      return;
    }

    const paymentMethod =
      document.getElementById("paymentMethod")
        ?.value || "Cash";

    const change =
      paid - total;

    const saleItems =
      cart.map(function(item) {

        return {
          productId: item.productId,
          name: item.name,
          price: Number(item.price),
          costPrice: Number(item.costPrice || 0),
          quantity: Number(item.quantity),
          type: item.type,
          discount: Number(item.discount || 0)
        };

      });

    /* REDUCE STOCK */

    cart.forEach(function(item) {

      const product =
        products.find(function(p) {
          return p.id === item.productId;
        });

      if (product) {

        product.stock =
          Math.max(
            0,
            Number(product.stock) -
            Number(item.quantity)
          );
      }
    });

    const sale = {

      id: Date.now(),

      date:
        new Date().toISOString(),

      customerName:
        customerName,

      customerPhone:
        customerPhone,

      paymentMethod:
        paymentMethod,

      items:
        saleItems,

      subtotal:
        getCartSubtotal(),

      discount:
        getCartDiscount(),

      total:
        total,

      cost:
        saleItems.reduce(function(sum, item) {
          return sum +
            Number(item.costPrice) *
            Number(item.quantity);
        }, 0),

      paid:
        paid,

      change:
        change
    };

    sales.unshift(sale);

    saveAllData();

    showReceipt(sale);

    cart = [];

    document.getElementById("customerName").value = "";
    document.getElementById("customerPhone").value = "";
    document.getElementById("amountPaid").value = "";

    renderCart();
    showProducts();
    renderSaleProducts();
    renderDashboard();
    showSalesHistory();
    showTodaySales();
    showExpenses();
    renderReports();

    alert("✅ Sale completed successfully.");
  });
}


/* =========================================================
   RECEIPT
========================================================= */

function showReceipt(sale) {

  const receipt =
    document.getElementById("receipt");

  if (!receipt) return;

  let itemsHTML = "";

  sale.items.forEach(function(item) {

    itemsHTML += `
      <div class="receipt-line">

        <span>
          ${escapeHTML(item.name)}
          × ${item.quantity}
        </span>

        <span>
          ${money(
            item.price * item.quantity -
            Number(item.discount || 0)
          )}
        </span>

      </div>
    `;
  });

  receipt.innerHTML = `

    <h2>
      ${escapeHTML(
        storeSettings.storeName || "My Store"
      )}
    </h2>

    ${
      storeSettings.ownerName
        ? `<p>${escapeHTML(storeSettings.ownerName)}</p>`
        : ""
    }

    ${
      storeSettings.address
        ? `<p>${escapeHTML(storeSettings.address)}</p>`
        : ""
    }

    ${
      storeSettings.city
        ? `<p>${escapeHTML(storeSettings.city)}</p>`
        : ""
    }

    ${
      storeSettings.phone
        ? `<p>${escapeHTML(storeSettings.phone)}</p>`
        : ""
    }

    <p><strong>SALES RECEIPT</strong></p>

    <hr>

    <p>
      <strong>Customer:</strong>
      ${escapeHTML(sale.customerName)}
    </p>

    <p>
      <strong>Phone:</strong>
      ${escapeHTML(sale.customerPhone)}
    </p>

    <p>
      <strong>Payment:</strong>
      ${escapeHTML(sale.paymentMethod)}
    </p>

    <p>
      <strong>Date:</strong>
      ${new Date(sale.date).toLocaleString()}
    </p>

    <hr>

    ${itemsHTML}

    <hr>

    <div class="receipt-line">
      <span>Subtotal</span>
      <strong>${money(sale.subtotal)}</strong>
    </div>

    <div class="receipt-line">
      <span>Discount</span>
      <strong>${money(sale.discount)}</strong>
    </div>

    <div class="receipt-line">
      <span>TOTAL</span>
      <strong>${money(sale.total)}</strong>
    </div>

    <div class="receipt-line">
      <span>PAID</span>
      <strong>${money(sale.paid)}</strong>
    </div>

    <div class="receipt-line">
      <span>CHANGE</span>
      <strong>${money(sale.change)}</strong>
    </div>

    <p>
      ${escapeHTML(
        storeSettings.receiptFooter ||
        "Thank you for shopping with us!"
      )}
    </p>

    <button
      class="primary-action"
      onclick="printReceipt()"
    >
      🖨️ Print Receipt
    </button>
  `;

  receipt.style.display = "block";
}

window.printReceipt = function() {

  const receipt =
    document.getElementById("receipt");

  if (!receipt) return;

  const printWindow =
    window.open("", "_blank");

  if (!printWindow) {
    alert("Please allow pop-ups to print.");
    return;
  }

  printWindow.document.write(`
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
          display:flex;
          justify-content:space-between;
          margin:8px 0;
          gap:20px;
        }

        button {
          display:none !important;
        }

        h2,
        p {
          text-align:center;
        }
      </style>
    </head>

    <body>
      ${receipt.innerHTML}
    </body>

    </html>
  `);

  printWindow.document.close();

  setTimeout(function() {
    printWindow.print();
  }, 300);
};


/* =========================================================
   CUSTOMER HISTORY
========================================================= */

function setupCustomerSearch() {

  const input =
    document.getElementById("customerSearch");

  if (!input) return;

  input.addEventListener("input", showCustomerHistory);
}

function showCustomerHistory() {

  const box =
    document.getElementById("customerHistory");

  const input =
    document.getElementById("customerSearch");

  if (!box || !input) return;

  const search =
    input.value.trim().toLowerCase();

  if (!search) {

    box.innerHTML =
      '<p class="empty">Search for a customer to view history.</p>';

    return;
  }

  const found =
    sales.filter(function(sale) {

      return (
        String(sale.customerName || "")
          .toLowerCase()
          .includes(search) ||

        String(sale.customerPhone || "")
          .toLowerCase()
          .includes(search)
      );
    });

  if (found.length === 0) {

    box.innerHTML =
      '<p class="empty">No customer history found.</p>';

    return;
  }

  const totalSpent =
    found.reduce(function(total, sale) {
      return total + Number(sale.total || 0);
    }, 0);

  let html = `

    <div class="history-card">

      <h3>
        👤 ${escapeHTML(found[0].customerName)}
      </h3>

      <p>
        Phone:
        ${escapeHTML(found[0].customerPhone)}
      </p>

      <p>
        Purchases:
        <strong>${found.length}</strong>
      </p>

      <p>
        Total Spent:
        <strong>${money(totalSpent)}</strong>
      </p>

    </div>
  `;

  found.forEach(function(sale) {

    html += `

      <div class="history-card">

        <strong>
          🧾 ${new Date(sale.date).toLocaleString()}
        </strong>

        <br><br>

        ${sale.items.map(function(item) {
          return `
            ${escapeHTML(item.name)}
            × ${item.quantity}
            — ${money(
              item.price * item.quantity
            )}
            <br>
          `;
        }).join("")}

        <br>

        <strong>
          Total: ${money(sale.total)}
        </strong>

        <br>

        Payment:
        ${escapeHTML(sale.paymentMethod)}

      </div>
    `;
  });

  box.innerHTML = html;
}


/* =========================================================
   SALES HISTORY
========================================================= */

function showSalesHistory() {

  const box =
    document.getElementById("salesHistory");

  if (!box) return;

  if (sales.length === 0) {

    box.innerHTML =
      '<p class="empty">No sales yet.</p>';

    return;
  }

  box.innerHTML =
    sales.map(function(sale) {

      return `

        <div class="history-card">

          <strong>
            🧾 Sale —
            ${new Date(sale.date).toLocaleString()}
          </strong>

          <br><br>

          Customer:
          ${escapeHTML(sale.customerName)}

          <br>

          Phone:
          ${escapeHTML(sale.customerPhone)}

          <br>

          Payment:
          ${escapeHTML(sale.paymentMethod)}

          <br><br>

          ${sale.items.map(function(item) {
            return `
              ${escapeHTML(item.name)}
              × ${item.quantity}
              — ${money(
                item.price * item.quantity
              )}
              <br>
            `;
          }).join("")}

          <br>

          <strong>
            Total: ${money(sale.total)}
          </strong>

          <br>

          Cost:
          ${money(getSaleCost(sale))}

          <br>

          Profit:
          ${money(getSaleProfit(sale))}

          <br>

          Paid:
          ${money(sale.paid)}

          <br>

          Change:
          ${money(sale.change)}

        </div>
      `;

    }).join("");

  const count =
    document.getElementById("salesTransactionCount");

  if (count) {
    count.textContent = sales.length;
  }
}

function showTodaySales() {

  const total =
    getTodayRevenue();

  const element =
    document.getElementById("salesTotal");

  if (element) {
    element.textContent =
      money(total);
  }

  const count =
    document.getElementById("salesTransactionCount");

  if (count) {
    count.textContent =
      sales.length;
  }
}


/* =========================================================
   EXPENSES
========================================================= */

function setupExpenseForm() {

  const button =
    document.getElementById("addExpenseButton");

  if (!button) return;

  button.addEventListener("click", function() {

    const name =
      document.getElementById("expenseName")
        ?.value.trim();

    const category =
      document.getElementById("expenseCategory")
        ?.value;

    const amount =
      Number(
        document.getElementById("expenseAmount")
          ?.value
      );

    const date =
      document.getElementById("expenseDate")
        ?.value;

    const notes =
      document.getElementById("expenseNotes")
        ?.value.trim();

    if (!name) {
      alert("Enter expense description.");
      return;
    }

    if (!amount || amount <= 0) {
      alert("Enter a valid expense amount.");
      return;
    }

    if (!date) {
      alert("Select expense date.");
      return;
    }

    expenses.unshift({

      id: Date.now(),

      name: name,

      category:
        category || "Other",

      amount: amount,

      date: date,

      notes: notes,

      createdAt:
        new Date().toISOString()
    });

    saveAllData();

    document.getElementById("expenseName").value = "";
    document.getElementById("expenseCategory").value = "";
    document.getElementById("expenseAmount").value = "";
    document.getElementById("expenseDate").value = "";
    document.getElementById("expenseNotes").value = "";

    showExpenses();
    renderDashboard();
    renderReports();

    alert("✅ Expense added.");
  });
}

function showExpenses() {

  const box =
    document.getElementById("expenseList");

  if (!box) return;

  if (expenses.length === 0) {

    box.innerHTML =
      '<p class="empty">No expenses recorded.</p>';

  } else {

    box.innerHTML =
      expenses.map(function(expense, index) {

        return `

          <div class="history-card">

            <div style="
              display:flex;
              justify-content:space-between;
              gap:15px;
            ">

              <strong>
                ${escapeHTML(expense.name)}
              </strong>

              <strong>
                ${money(expense.amount)}
              </strong>

            </div>

            <small>
              ${escapeHTML(expense.category)}
              • ${escapeHTML(expense.date)}
            </small>

            ${
              expense.notes
                ? `<p>${escapeHTML(expense.notes)}</p>`
                : ""
            }

            <button
              onclick="deleteExpense(${index})"
              style="
                background:#dc2626;
                color:white;
                border:0;
                padding:7px 10px;
                border-radius:7px;
                cursor:pointer;
              "
            >
              Delete
            </button>

          </div>
        `;

      }).join("");
  }

  const total =
    expenses.reduce(function(sum, expense) {
      return sum + Number(expense.amount || 0);
    }, 0);

  const totalBox =
    document.getElementById("totalExpenses");

  if (totalBox) {
    totalBox.textContent =
      money(total);
  }
}

window.deleteExpense = function(index) {

  if (!expenses[index]) return;

  if (!confirm("Delete this expense?")) {
    return;
  }

  expenses.splice(index, 1);

  saveAllData();

  showExpenses();
  renderDashboard();
  renderReports();
};


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

  const revenue =
    getTodayRevenue();

  const cost =
    getTodayCost();

  const grossProfit =
    revenue - cost;

  const expensesToday =
    getTodayExpenses();

  const netProfit =
    grossProfit - expensesToday;

  const values = {

    revenueStat:
      money(revenue),

    grossProfitStat:
      money(grossProfit),

    expenseStat:
      money(expensesToday),

    netProfitStat:
      money(netProfit),

    transactionCount:
      sales.length,

    productCount:
      products.length,

    lowStock:
      products.filter(function(product) {
        return Number(product.stock) <= 5;
      }).length
  };

  Object.keys(values).forEach(function(id) {

    const element =
      document.getElementById(id);

    if (element) {
      element.textContent =
        values[id];
    }
  });

  renderRecentSales();
}

function renderRecentSales() {

  const box =
    document.getElementById("recentSales");

  if (!box) return;

  const recent =
    sales.slice(0, 5);

  if (recent.length === 0) {

    box.innerHTML =
      '<p class="empty">No sales yet.</p>';

    return;
  }

  box.innerHTML =
    recent.map(function(sale) {

      return `

        <div class="history-card">

          <div style="
            display:flex;
            justify-content:space-between;
            gap:15px;
          ">

            <strong>
              ${escapeHTML(sale.customerName)}
            </strong>

            <strong>
              ${money(sale.total)}
            </strong>

          </div>

          <small>
            ${new Date(sale.date).toLocaleString()}
            • ${escapeHTML(sale.paymentMethod)}
          </small>

        </div>
      `;

    }).join("");
}


/* =========================================================
   REPORTS
========================================================= */

function renderReports() {

  const revenue =
    sales.reduce(function(sum, sale) {
      return sum + Number(sale.total || 0);
    }, 0);

  const cost =
    sales.reduce(function(sum, sale) {
      return sum + getSaleCost(sale);
    }, 0);

  const grossProfit =
    revenue - cost;

  const totalExpense =
    expenses.reduce(function(sum, expense) {
      return sum + Number(expense.amount || 0);
    }, 0);

  const netProfit =
    grossProfit - totalExpense;

  const values = {

    reportRevenue:
      money(revenue),

    reportCost:
      money(cost),

    reportGrossProfit:
      money(grossProfit),

    reportExpenses:
      money(totalExpense),

    reportNetProfit:
      money(netProfit)
  };

  Object.keys(values).forEach(function(id) {

    const element =
      document.getElementById(id);

    if (element) {
      element.textContent =
        values[id];
    }
  });

  renderBestSellingProducts();
}

function renderBestSellingProducts() {

  const box =
    document.getElementById("bestSellingProducts");

  if (!box) return;

  const totals = {};

  sales.forEach(function(sale) {

    sale.items.forEach(function(item) {

      if (!totals[item.name]) {
        totals[item.name] = 0;
      }

      totals[item.name] +=
        Number(item.quantity || 0);
    });

  });

  const ranking =
    Object.entries(totals)
      .sort(function(a, b) {
        return b[1] - a[1];
      });

  if (ranking.length === 0) {

    box.innerHTML =
      '<p class="empty">No sales data yet.</p>';

    return;
  }

  box.innerHTML =
    ranking.slice(0, 10)
      .map(function(item, index) {

        return `

          <div class="history-card">

            <strong>
              #${index + 1}
              ${escapeHTML(item[0])}
            </strong>

            <span>
              ${item[1]} units sold
            </span>

          </div>
        `;

      }).join("");
}


/* =========================================================
   BACKUP / RESTORE
========================================================= */

function setupBackup() {

  const exportButton =
    document.getElementById("exportDataButton");

  const importInput =
    document.getElementById("importDataInput");

  if (exportButton) {

    exportButton.addEventListener("click", function() {

      const backup = {

        version: 2,

        exportedAt:
          new Date().toISOString(),

        products:
          products,

        sales:
          sales,

        expenses:
          expenses,

        storeSettings:
          storeSettings
      };

      const blob =
        new Blob(
          [JSON.stringify(backup, null, 2)],
          {
            type: "application/json"
          }
        );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        "my-store-pos-backup.json";

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(url);
    });
  }

  if (importInput) {

    importInput.addEventListener("change", function(event) {

      const file =
        event.target.files[0];

      if (!file) return;

      const reader =
        new FileReader();

      reader.onload = function(e) {

        try {

          const backup =
            JSON.parse(e.target.result);

          if (!backup || typeof backup !== "object") {
            throw new Error("Invalid backup.");
          }

          products =
            Array.isArray(backup.products)
              ? backup.products
              : [];

          sales =
            Array.isArray(backup.sales)
              ? backup.sales
              : [];

          expenses =
            Array.isArray(backup.expenses)
              ? backup.expenses
              : [];

          if (backup.storeSettings) {

            storeSettings = {
              ...storeSettings,
              ...backup.storeSettings
            };
          }

          cart = [];

          saveAllData();

          loadStoreSettings();

          showProducts();
          renderSaleProducts();
          renderCart();
          showSalesHistory();
          showTodaySales();
          showExpenses();
          renderDashboard();
          renderReports();

          alert("✅ Backup restored successfully.");

        } catch (error) {

          console.error(error);

          alert(
            "❌ This backup file is not valid."
          );
        }

        event.target.value = "";
      };

      reader.readAsText(file);
    });
  }
}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

  const productSearch =
    document.getElementById("productSearch");

  const saleType =
    document.getElementById("saleType");

  const inventorySearch =
    document.getElementById("inventorySearch");

  if (productSearch) {
    productSearch.addEventListener(
      "input",
      renderSaleProducts
    );
  }

  if (saleType) {
    saleType.addEventListener(
      "change",
      renderSaleProducts
    );
  }

  if (inventorySearch) {

    inventorySearch.addEventListener(
      "input",
      function() {

        const query =
          inventorySearch.value
            .trim()
            .toLowerCase();

        const filtered =
          products.filter(function(product) {

            return (
              product.name
                .toLowerCase()
                .includes(query) ||

              String(product.sku || "")
                .toLowerCase()
                .includes(query) ||

              String(product.category || "")
                .toLowerCase()
                .includes(query)
            );
          });

        showProducts(filtered);
      }
    );
  }
}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    loadAllData();

    loadStoreSettings();

    setupSettings();

    setupProductForm();

    setupCompleteSale();

    setupExpenseForm();

    setupCustomerSearch();

    setupBackup();

    setupSearch();

    const amountPaid =
      document.getElementById("amountPaid");

    if (amountPaid) {
      amountPaid.addEventListener(
        "input",
        calculateChange
      );
    }

    const defaultSaleType =
      document.getElementById("defaultSaleType");

    if (defaultSaleType) {

      defaultSaleType.addEventListener(
        "change",
        function() {

          storeSettings.defaultSaleType =
            defaultSaleType.value;

          saveAllData();
        }
      );
    }

    showProducts();

    renderSaleProducts();

    renderCart();

    showSalesHistory();

    showTodaySales();

    showExpenses();

    renderDashboard();

    renderReports();

    /* Set today's date for expenses */

    const expenseDate =
      document.getElementById("expenseDate");

    if (
      expenseDate &&
      !expenseDate.value
    ) {

      const now =
        new Date();

      const localDate =
        new Date(
          now.getTime() -
          now.getTimezoneOffset() * 60000
        )
        .toISOString()
        .split("T")[0];

      expenseDate.value =
        localDate;
    }

    /* Apply default sale type */

    const saleType =
      document.getElementById("saleType");

    if (saleType) {
      saleType.value =
        storeSettings.defaultSaleType || "retail";
    }

    console.log("My Store POS V2 loaded successfully.");
  }
);
