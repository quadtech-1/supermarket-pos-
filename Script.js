/* =========================================================
   MY STORE POS — V2 SCRIPT
   ========================================================= */

"use strict";

/* =========================================================
   STORAGE KEYS
   ========================================================= */

const STORAGE = {
  products: "posProducts",
  sales: "posSales",
  expenses: "posExpenses",
  settings: "posStoreSettings"
};


/* =========================================================
   DEFAULT DATA
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
  currency: "₦",
  receiptFooter: "Thank you for shopping with us!"
};


/* =========================================================
   LOAD DATA SAFELY
   ========================================================= */

function loadJSON(key, fallback) {

  try {

    const data = localStorage.getItem(key);

    return data
      ? JSON.parse(data)
      : fallback;

  } catch (error) {

    console.error(
      "Could not load:",
      key,
      error
    );

    return fallback;
  }
}


products =
  loadJSON(
    STORAGE.products,
    []
  );

sales =
  loadJSON(
    STORAGE.sales,
    []
  );

expenses =
  loadJSON(
    STORAGE.expenses,
    []
  );

storeSettings = {
  ...storeSettings,
  ...loadJSON(
    STORAGE.settings,
    {}
  )
};


/* =========================================================
   SAVE DATA
   ========================================================= */

function saveData() {

  localStorage.setItem(
    STORAGE.products,
    JSON.stringify(products)
  );

  localStorage.setItem(
    STORAGE.sales,
    JSON.stringify(sales)
  );

  localStorage.setItem(
    STORAGE.expenses,
    JSON.stringify(expenses)
  );
}


function saveSettings() {

  localStorage.setItem(
    STORAGE.settings,
    JSON.stringify(storeSettings)
  );
}


/* =========================================================
   HELPERS
   ========================================================= */

function money(amount) {

  return (
    storeSettings.currency +
    Number(amount || 0).toLocaleString()
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


function generateId() {

  return Date.now() +
    Math.floor(
      Math.random() * 1000
    );

}


/* =========================================================
   NAVIGATION
   ========================================================= */

window.openPage =
function(pageId, button) {

  document
    .querySelectorAll(".page")
    .forEach(function(page) {

      page.classList.remove("active");

    });


  const page =
    document.getElementById(pageId);

  if (page) {

    page.classList.add("active");

  }


  document
    .querySelectorAll(
      ".side-item, .mobile-nav-item"
    )
    .forEach(function(item) {

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


/* =========================================================
   REFRESH PAGE
   ========================================================= */

function refreshPage(pageId) {

  if (
    pageId === "homePage" ||
    pageId === "dashboardPage"
  ) {

    updateDashboard();
    renderRecentSales();

  }


  if (pageId === "posPage") {

    renderPOSProducts();
    renderCart();

  }


  if (pageId === "inventoryPage") {

    renderInventory();

  }


  if (pageId === "customersPage") {

    renderCustomers();

  }


  if (pageId === "salesPage") {

    renderSales();

  }


  if (pageId === "expensesPage") {

    renderExpenses();

  }


  if (pageId === "reportsPage") {

    renderReports();

  }


  if (pageId === "settingsPage") {

    loadSettingsForm();

  }

}


/* =========================================================
   PRODUCT CATEGORIES
   ========================================================= */

function getCategories() {

  const categories =
    products
      .map(function(product) {

        return product.category;

      })
      .filter(Boolean);


  return [
    ...new Set(categories)
  ];

}


/* =========================================================
   ADD PRODUCT
   ========================================================= */

window.addProduct =
function() {

  const name =
    getValue("productName");

  const cost =
    Number(
      getValue("productCostPrice")
    );

  const retail =
    Number(
      getValue("productRetailPrice")
    );

  const wholesale =
    Number(
      getValue("productWholesalePrice")
    );

  const stock =
    Number(
      getValue("productStock")
    );

  const category =
    getValue("productCategory");

  const sku =
    getValue("productSKU");


  if (!name) {

    alert(
      "Please enter product name."
    );

    return;

  }


  if (cost < 0) {

    alert(
      "Please enter a valid cost price."
    );

    return;

  }


  if (retail <= 0) {

    alert(
      "Please enter a valid selling price."
    );

    return;

  }


  if (wholesale < 0) {

    alert(
      "Please enter a valid wholesale price."
    );

    return;

  }


  if (
    isNaN(stock) ||
    stock < 0
  ) {

    alert(
      "Please enter valid stock quantity."
    );

    return;

  }


  const product = {

    id: generateId(),

    name: name,

    sku:
      sku ||
      "SKU-" +
      Date.now(),

    category:
      category ||
      "General",

    costPrice: cost,

    retailPrice: retail,

    wholesalePrice: wholesale,

    stock: stock,

    createdAt:
      new Date().toISOString()

  };


  products.push(product);

  saveData();

  clearProductForm();

  renderInventory();

  renderPOSProducts();

  updateDashboard();

  alert(
    "✅ Product added successfully."
  );

};


/* =========================================================
   CLEAR PRODUCT FORM
   ========================================================= */

function clearProductForm() {

  [
    "productName",
    "productSKU",
    "productCategory",
    "productCostPrice",
    "productRetailPrice",
    "productWholesalePrice",
    "productStock"
  ]
  .forEach(function(id) {

    const element =
      document.getElementById(id);

    if (element) {

      element.value = "";

    }

  });

}


/* =========================================================
   DELETE PRODUCT
   ========================================================= */

window.deleteProduct =
function(id) {

  const index =
    products.findIndex(function(product) {

      return String(product.id) ===
        String(id);

    });


  if (index === -1) return;


  const product =
    products[index];


  if (
    !confirm(
      `Delete "${product.name}"?`
    )
  ) {

    return;

  }


  products.splice(
    index,
    1
  );

  saveData();

  renderInventory();
  renderPOSProducts();
  updateDashboard();

};


/* =========================================================
   INVENTORY
   ========================================================= */

function renderInventory() {

  const container =
    document.getElementById(
      "inventoryList"
    );

  if (!container) return;


  if (products.length === 0) {

    container.innerHTML =
      `<div class="empty">
        No products added yet.
      </div>`;

    return;

  }


  container.innerHTML =
    products.map(function(product) {

      const stock =
        Number(product.stock);


      let status =
        "In stock";


      if (stock <= 0) {

        status =
          "Out of stock";

      } else if (stock <= 5) {

        status =
          "Low stock";

      }


      return `

        <div class="product-card">

          <div class="product-top">

            <div>

              <strong>
                ${escapeHTML(
                  product.name
                )}
              </strong>

              <small>
                SKU:
                ${escapeHTML(
                  product.sku
                )}
              </small>

              <small>
                Category:
                ${escapeHTML(
                  product.category
                )}
              </small>

            </div>

            <strong>
              ${stock}
            </strong>

          </div>


          <div class="product-price">

            Cost:
            ${money(product.costPrice)}

          </div>


          <div class="product-price">

            Retail:
            ${money(product.retailPrice)}

          </div>


          <div class="product-price">

            Wholesale:
            ${money(product.wholesalePrice)}

          </div>


          <div class="stock">

            ${status}

          </div>


          <button
            onclick="deleteProduct('${product.id}')"
          >

            🗑️ Delete

          </button>

        </div>

      `;

    }).join("");

}


/* =========================================================
   POS PRODUCTS
   ========================================================= */

function renderPOSProducts() {

  const container =
    document.getElementById(
      "posProducts"
    );

  if (!container) return;


  const search =
    getValue(
      "productSearch"
    ).toLowerCase();


  const category =
    getValue(
      "posCategory"
    );


  const filtered =
    products.filter(function(product) {

      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(search) ||

        String(product.sku)
          .toLowerCase()
          .includes(search);


      const matchesCategory =
        !category ||
        category === "all" ||
        product.category === category;


      return (
        matchesSearch &&
        matchesCategory
      );

    });


  if (filtered.length === 0) {

    container.innerHTML =
      `<div class="empty">
        No products found.
      </div>`;

    return;

  }


  container.innerHTML =
    filtered.map(function(product) {

      const disabled =
        Number(product.stock) <= 0
          ? "disabled"
          : "";


      return `

        <div class="sale-product">

          <div class="sale-product-info">

            <strong>
              ${escapeHTML(
                product.name
              )}
            </strong>

            <small>
              ${escapeHTML(
                product.category
              )}
            </small>

            <small>
              ${money(
                getSalePrice(product)
              )}
              • Stock:
              ${product.stock}
            </small>

          </div>


          <button
            class="add-button"
            onclick="addToCart('${product.id}')"
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

    }).join("");

}


/* =========================================================
   SALE PRICE
   ========================================================= */

function getSalePrice(product) {

  const type =
    getValue("saleType") ||
    getValue("homeSaleType") ||
    "retail";


  if (type === "wholesale") {

    return Number(
      product.wholesalePrice
    );

  }


  return Number(
    product.retailPrice
  );

}


/* =========================================================
   ADD TO CART
   ========================================================= */

window.addToCart =
function(productId) {

  const product =
    products.find(function(item) {

      return String(item.id) ===
        String(productId);

    });


  if (!product) return;


  if (
    Number(product.stock) <= 0
  ) {

    alert(
      "This product is out of stock."
    );

    return;

  }


  const price =
    getSalePrice(product);


  const existing =
    cart.find(function(item) {

      return String(item.productId) ===
        String(product.id);

    });


  if (existing) {

    if (
      existing.quantity >=
      Number(product.stock)
    ) {

      alert(
        "Not enough stock."
      );

      return;

    }


    existing.quantity++;

  } else {

    cart.push({

      productId:
        product.id,

      name:
        product.name,

      price:
        price,

      costPrice:
        Number(
          product.costPrice
        ),

      quantity:
        1

    });

  }


  renderCart();

};


/* =========================================================
   CART TOTAL
   ========================================================= */

function getSubtotal() {

  return cart.reduce(
    function(total, item) {

      return total +
        (
          item.price *
          item.quantity
        );

    },
    0
  );

}


function getDiscount() {

  const discount =
    Number(
      getValue("discount")
    );


  if (
    isNaN(discount) ||
    discount < 0
  ) {

    return 0;

  }


  return discount;

}


function getCartTotal() {

  const subtotal =
    getSubtotal();


  const discount =
    getDiscount();


  return Math.max(
    0,
    subtotal - discount
  );

}


/* =========================================================
   CART RENDER
   ========================================================= */

function renderCart() {

  const container =
    document.getElementById(
      "cart"
    );

  if (!container) return;


  if (cart.length === 0) {

    container.innerHTML =
      `<div class="empty">
        🛒 Cart is empty
      </div>`;

  } else {

    container.innerHTML =
      cart.map(function(item, index) {

        const subtotal =
          item.price *
          item.quantity;


        return `

          <div class="cart-item">

            <div class="cart-row">

              <strong>
                ${escapeHTML(
                  item.name
                )}
              </strong>

              <strong>
                ${money(subtotal)}
              </strong>

            </div>


            <small>
              ${money(item.price)}
              each
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

          </div>

        `;

      }).join("");

  }


  const subtotalBox =
    document.getElementById(
      "cartSubtotal"
    );

  const totalBox =
    document.getElementById(
      "cartTotal"
    );


  if (subtotalBox) {

    subtotalBox.textContent =
      money(getSubtotal());

  }


  if (totalBox) {

    totalBox.textContent =
      money(getCartTotal());

  }


  calculateChange();

}


/* =========================================================
   QUANTITY
   ========================================================= */

window.increaseQuantity =
function(index) {

  const item =
    cart[index];


  if (!item) return;


  const product =
    products.find(function(product) {

      return String(product.id) ===
        String(item.productId);

    });


  if (!product) return;


  if (
    item.quantity >=
    Number(product.stock)
  ) {

    alert(
      "Not enough stock."
    );

    return;

  }


  item.quantity++;

  renderCart();

};


window.decreaseQuantity =
function(index) {

  if (!cart[index]) return;


  if (
    cart[index].quantity > 1
  ) {

    cart[index].quantity--;

  } else {

    cart.splice(
      index,
      1
    );

  }


  renderCart();

};


window.removeFromCart =
function(index) {

  cart.splice(
    index,
    1
  );

  renderCart();

};


/* =========================================================
   CHANGE
   ========================================================= */

function calculateChange() {

  const box =
    document.getElementById(
      "changeDisplay"
    );


  if (!box) return;


  const total =
    getCartTotal();


  const paid =
    Number(
      getValue("amountPaid")
    );


  if (
    !total ||
    !paid
  ) {

    box.innerHTML = "";

    return;

  }


  if (paid < total) {

    box.innerHTML = `

      <strong>
        Amount remaining:
        ${money(total - paid)}
      </strong>

    `;

  } else {

    box.innerHTML = `

      <strong>
        Change:
        ${money(paid - total)}
      </strong>

    `;

  }

}


/* =========================================================
   COMPLETE SALE
   ========================================================= */

window.completeSale =
function() {

  if (cart.length === 0) {

    alert(
      "Your cart is empty."
    );

    return;

  }


  const customerName =
    getValue("customerName");


  const customerPhone =
    getValue("customerPhone");


  if (!customerName) {

    alert(
      "Please enter customer name."
    );

    return;

  }


  if (!customerPhone) {

    alert(
      "Please enter customer phone."
    );

    return;

  }


  const subtotal =
    getSubtotal();


  const discount =
    getDiscount();


  const total =
    getCartTotal();


  const paid =
    Number(
      getValue("amountPaid")
    );


  if (
    isNaN(paid) ||
    paid < total
  ) {

    alert(
      "Amount paid is not enough.\n\n" +
      "Total: " +
      money(total)
    );

    return;

  }


  const paymentMethod =
    getValue(
      "paymentMethod"
    ) || "Cash";


  const change =
    paid - total;


  /* ==========================
     CALCULATE PROFIT
     ========================== */

  const cost =
    cart.reduce(
      function(totalCost, item) {

        return totalCost +
          (
            item.costPrice *
            item.quantity
          );

      },
      0
    );


  const grossProfit =
    total - cost;


  /* ==========================
     REDUCE STOCK
     ========================== */

  cart.forEach(function(item) {

    const product =
      products.find(function(product) {

        return String(product.id) ===
          String(item.productId);

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


  /* ==========================
     SAVE SALE
     ========================== */

  const sale = {

    id:
      generateId(),

    date:
      new Date().toISOString(),

    customerName:
      customerName,

    customerPhone:
      customerPhone,

    paymentMethod:
      paymentMethod,

    items:
      cart.map(function(item) {

        return {

          productId:
            item.productId,

          name:
            item.name,

          price:
            item.price,

          costPrice:
            item.costPrice,

          quantity:
            item.quantity

        };

      }),

    subtotal:
      subtotal,

    discount:
      discount,

    total:
      total,

    cost:
      cost,

    grossProfit:
      grossProfit,

    paid:
      paid,

    change:
      change

  };


  sales.unshift(
    sale
  );


  saveData();


  showReceipt(
    sale
  );


  cart = [];


  clearSaleForm();


  renderCart();

  renderPOSProducts();

  renderInventory();

  updateDashboard();

  renderRecentSales();

  renderSales();

  renderCustomers();

  renderReports();


  alert(
    "✅ Sale completed successfully!"
  );

};


/* =========================================================
   CLEAR SALE FORM
   ========================================================= */

function clearSaleForm() {

  [
    "customerName",
    "customerPhone",
    "amountPaid",
    "discount"
  ]
  .forEach(function(id) {

    const element =
      document.getElementById(id);

    if (element) {

      element.value = "";

    }

  });


  const payment =
    document.getElementById(
      "paymentMethod"
    );


  if (payment) {

    payment.value =
      "Cash";

  }


  calculateChange();

}


/* =========================================================
   EXPENSES
   ========================================================= */

window.addExpense =
function() {

  const category =
    getValue(
      "expenseCategory"
    );


  const amount =
    Number(
      getValue(
        "expenseAmount"
      )
    );


  const date =
    getValue(
      "expenseDate"
    ) ||
    new Date()
      .toISOString()
      .slice(
        0,
        10
      );


  const notes =
    getValue(
      "expenseNotes"
    );


  if (!category) {

    alert(
      "Please select an expense category."
    );

    return;

  }


  if (
    isNaN(amount) ||
    amount <= 0
  ) {

    alert(
      "Please enter a valid expense amount."
    );

    return;

  }


  expenses.unshift({

    id:
      generateId(),

    category:
      category,

    amount:
      amount,

    date:
      date,

    notes:
      notes

  });


  saveData();

  clearExpenseForm();

  renderExpenses();

  updateDashboard();

  renderReports();


  alert(
    "✅ Expense added."
  );

};


/* =========================================================
   EXPENSE FORM
   ========================================================= */

function clearExpenseForm() {

  [
    "expenseCategory",
    "expenseAmount",
    "expenseDate",
    "expenseNotes"
  ]
  .forEach(function(id) {

    const element =
      document.getElementById(id);

    if (element) {

      element.value = "";

    }

  });

}


/* =========================================================
   DELETE EXPENSE
   ========================================================= */

window.deleteExpense =
function(id) {

  const index =
    expenses.findIndex(function(expense) {

      return String(expense.id) ===
        String(id);

    });


  if (index === -1) return;


  if (
    !confirm(
      "Delete this expense?"
    )
  ) {

    return;

  }


  expenses.splice(
    index,
    1
  );

  saveData();

  renderExpenses();

  updateDashboard();

  renderReports();

};


/* =========================================================
   EXPENSE DISPLAY
   ========================================================= */

function renderExpenses() {

  const container =
    document.getElementById(
      "expensesList"
    );


  if (!container) return;


  if (expenses.length === 0) {

    container.innerHTML =
      `<div class="empty">
        No expenses yet.
      </div>`;

    return;

  }


  container.innerHTML =
    expenses.map(function(expense) {

      return `

        <div class="history-card">

          <strong>
            ${escapeHTML(
              expense.category
            )}
          </strong>

          <p>
            ${money(
              expense.amount
            )}
          </p>

          <small>
            ${escapeHTML(
              expense.date
            )}
          </small>

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
            🗑️ Delete
          </button>

        </div>

      `;

    }).join("");

}


/* =========================================================
   CUSTOMERS
   ========================================================= */

function getCustomers() {

  const map =
    new Map();


  sales.forEach(function(sale) {

    const phone =
      sale.customerPhone || "";


    const key =
      phone ||
      sale.customerName;


    if (!key) return;


    if (!map.has(key)) {

      map.set(
        key,
        {
          name:
            sale.customerName,

          phone:
            phone,

          purchases:
            0,

          spent:
            0
        }
      );

    }


    const customer =
      map.get(key);


    customer.purchases++;

    customer.spent +=
      Number(
        sale.total
      );

  });


  return [
    ...map.values()
  ];

}


/* =========================================================
   CUSTOMER DISPLAY
   ========================================================= */

function renderCustomers() {

  const container =
    document.getElementById(
      "customersList"
    );


  if (!container) return;


  const customers =
    getCustomers();


  if (customers.length === 0) {

    container.innerHTML =
      `<div class="empty">
        No customers yet.
      </div>`;

    return;

  }


  container.innerHTML =
    customers.map(function(customer) {

      return `

        <div class="history-card">

          <h3>
            👤
            ${escapeHTML(
              customer.name
            )}
          </h3>

          <p>
            📞
            ${escapeHTML(
              customer.phone
            )}
          </p>

          <p>
            Purchases:
            <strong>
              ${customer.purchases}
            </strong>
          </p>

          <p>
            Total spent:
            <strong>
              ${money(
                customer.spent
              )}
            </strong>
          </p>

        </div>

      `;

    }).join("");

}


/* =========================================================
   SALES HISTORY
   ========================================================= */

function renderSales() {

  const container =
    document.getElementById(
      "salesHistory"
    );


  if (!container) return;


  if (sales.length === 0) {

    container.innerHTML =
      `<div class="empty">
        No sales yet.
      </div>`;

    return;

  }


  container.innerHTML =
    sales.map(function(sale) {

      return `

        <div class="history-card">

          <strong>
            🧾 Sale
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

          <p>
            Total:
            <strong>
              ${money(
                sale.total
              )}
            </strong>
          </p>

          <p>
            Gross profit:
            <strong>
              ${money(
                sale.grossProfit
              )}
            </strong>
          </p>

        </div>

      `;

    }).join("");

}


/* =========================================================
   RECENT SALES
   ========================================================= */

function renderRecentSales() {

  const container =
    document.getElementById(
      "recentSales"
    );


  if (!container) return;


  const recent =
    sales.slice(
      0,
      5
    );


  if (recent.length === 0) {

    container.innerHTML =
      `<div class="empty">
        No recent sales.
      </div>`;

    return;

  }


  container.innerHTML =
    recent.map(function(sale) {

      return `

        <div class="recent-sale">

          <div>

            <strong>
              ${escapeHTML(
                sale.customerName
              )}
            </strong>

            <small>
              ${new Date(
                sale.date
              ).toLocaleString()}
            </small>

          </div>

          <strong>
            ${money(
              sale.total
            )}
          </strong>

        </div>

      `;

    }).join("");

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function getRevenue() {

  return sales.reduce(
    function(total, sale) {

      return total +
        Number(
          sale.total
        );

    },
    0
  );

}


function getCost() {

  return sales.reduce(
    function(total, sale) {

      return total +
        Number(
          sale.cost || 0
        );

    },
    0
  );

}


function getGrossProfit() {

  return getRevenue() -
    getCost();

}


function getExpenses() {

  return expenses.reduce(
    function(total, expense) {

      return total +
        Number(
          expense.amount
        );

    },
    0
  );

}


function getNetProfit() {

  return getGrossProfit() -
    getExpenses();

}


function updateDashboard() {

  setText(
    "revenue",
    money(
      getRevenue()
    )
  );


  setText(
    "grossProfit",
    money(
      getGrossProfit()
    )
  );


  setText(
    "expenses",
    money(
      getExpenses()
    )
  );


  setText(
    "netProfit",
    money(
      getNetProfit()
    )
  );


  setText(
    "transactionCount",
    sales.length
  );


  setText(
    "productCount",
    products.length
  );


  setText(
    "lowStock",
    products.filter(
      function(product) {

        return Number(
          product.stock
        ) <= 5;

      }
    ).length
  );


  setText(
    "customerCount",
    getCustomers().length
  );


  const todayRevenue =
    sales
      .filter(function(sale) {

        return new Date(
          sale.date
        ).toDateString() ===
        todayString();

      })
      .reduce(
        function(total, sale) {

          return total +
            Number(
              sale.total
            );

        },
        0
      );


  setText(
    "todayRevenue",
    money(
      todayRevenue
    )
  );

}


/* =========================================================
   REPORTS
   ========================================================= */

function renderReports() {

  const bestSelling =
    getBestSellingProducts();


  setText(
    "reportRevenue",
    money(
      getRevenue()
    )
  );


  setText(
    "reportCost",
    money(
      getCost()
    )
  );


  setText(
    "reportGrossProfit",
    money(
      getGrossProfit()
    )
  );


  setText(
    "reportExpenses",
    money(
      getExpenses()
    )
  );


  setText(
    "reportNetProfit",
    money(
      getNetProfit()
    )
  );


  const container =
    document.getElementById(
      "bestSellingProducts"
    );


  if (!container) return;


  if (bestSelling.length === 0) {

    container.innerHTML =
      `<div class="empty">
        No sales data yet.
      </div>`;

    return;

  }


  container.innerHTML =
    bestSelling.map(function(item) {

      return `

        <div class="recent-sale">

          <span>
            ${escapeHTML(
              item.name
            )}
          </span>

          <strong>
            ${item.quantity} sold
          </strong>

        </div>

      `;

    }).join("");

}


/* =========================================================
   BEST SELLING PRODUCTS
   ========================================================= */

function getBestSellingProducts() {

  const map =
    new Map();


  sales.forEach(function(sale) {

    sale.items.forEach(function(item) {

      if (
        !map.has(
          item.name
        )
      ) {

        map.set(
          item.name,
          0
        );

      }


      map.set(
        item.name,

        map.get(
          item.name
        ) +
        Number(
          item.quantity
        )
      );

    });

  });


  return [
    ...map.entries()
  ]
  .map(function(entry) {

    return {

      name:
        entry[0],

      quantity:
        entry[1]

    };

  })
  .sort(
    function(a, b) {

      return b.quantity -
        a.quantity;

    }
  )
  .slice(
    0,
    10
  );

}


/* =========================================================
   SETTINGS
   ========================================================= */

function loadSettingsForm() {

  setValue(
    "storeName",
    storeSettings.storeName
  );

  setValue(
    "ownerName",
    storeSettings.ownerName
  );

  setValue(
    "storePhone",
    storeSettings.phone
  );

  setValue(
    "storeEmail",
    storeSettings.email
  );

  setValue(
    "storeAddress",
    storeSettings.address
  );

  setValue(
    "storeCity",
    storeSettings.city
  );

  setValue(
    "receiptFooter",
    storeSettings.receiptFooter
  );


  updateStoreTitle();

}


/* =========================================================
   SAVE SETTINGS
   ========================================================= */

window.saveStoreSettings =
function() {

  const name =
    getValue(
      "storeName"
    );


  if (!name) {

    alert(
      "Please enter your store name."
    );

    return;

  }


  storeSettings = {

    ...storeSettings,

    storeName:
      name,

    ownerName:
      getValue(
        "ownerName"
      ),

    phone:
      getValue(
        "storePhone"
      ),

    email:
      getValue(
        "storeEmail"
      ),

    address:
      getValue(
        "storeAddress"
      ),

    city:
      getValue(
        "storeCity"
      ),

    receiptFooter:
      getValue(
        "receiptFooter"
      ) ||
      "Thank you for shopping with us!"

  };


  saveSettings();

  updateStoreTitle();


  const message =
    document.getElementById(
      "storeSaveMessage"
    );


  if (message) {

    message.textContent =
      "✅ Business information saved.";

    setTimeout(
      function() {

        message.textContent =
          "";

      },
      3000
    );

  }

};


/* =========================================================
   STORE TITLE
   ========================================================= */

function updateStoreTitle() {

  const title =
    document.getElementById(
      "appStoreName"
    );


  const letter =
    document.getElementById(
      "profileLetter"
    );


  const name =
    storeSettings.storeName ||
    "My Store";


  if (title) {

    title.textContent =
      name;

  }


  if (letter) {

    letter.textContent =
      name
        .charAt(0)
        .toUpperCase();

  }


  document.title =
    name +
    " POS";

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


  let itemsHTML =
    "";


  sale.items.forEach(function(item) {

    itemsHTML += `

      <div class="receipt-line">

        <span>
          ${escapeHTML(
            item.name
          )}
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

  });


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
      storeSettings.city
        ? `<p>
            ${escapeHTML(
              storeSettings.city
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

    <strong>
      SALES RECEIPT
    </strong>

    <p>
      Customer:
      ${escapeHTML(
        sale.customerName
      )}
    </p>

    <p>
      Phone:
      ${escapeHTML(
        sale.customerPhone
      )}
    </p>

    <p>
      Payment:
      ${escapeHTML(
        sale.paymentMethod
      )}
    </p>

    <p>
      Date:
      ${new Date(
        sale.date
      ).toLocaleString()}
    </p>

    <hr>

    ${itemsHTML}

    <hr>

    <div class="receipt-line">

      <strong>
        SUBTOTAL
      </strong>

      <strong>
        ${money(
          sale.subtotal
        )}
      </strong>

    </div>

    <div class="receipt-line">

      <strong>
        DISCOUNT
      </strong>

      <strong>
        ${money(
          sale.discount
        )}
      </strong>

    </div>

    <div class="receipt-line">

      <strong>
        TOTAL
      </strong>

      <strong>
        ${money(
          sale.total
        )}
      </strong>

    </div>

    <div class="receipt-line">

      <span>
        PAID
      </span>

      <span>
        ${money(
          sale.paid
        )}
      </span>

    </div>

    <div class="receipt-line">

      <span>
        CHANGE
      </span>

      <span>
        ${money(
          sale.change
        )}
      </span>

    </div>

    <p>
      ${escapeHTML(
        storeSettings.receiptFooter
      )}
    </p>

    <button
      class="primary-action"
      onclick="printReceipt()"
    >
      🖨️ Print Receipt
    </button>

  `;


  receipt.style.display =
    "block";

}


/* =========================================================
   PRINT RECEIPT
   ========================================================= */

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
      "Please allow pop-ups to print."
    );

    return;

  }


  printWindow.document.write(`

    <html>

      <head>

        <title>
          ${escapeHTML(
            storeSettings.storeName
          )}
        </title>

        <style>

          body {

            font-family:
              Arial,
              sans-serif;

            max-width:
              400px;

            margin:
              auto;

            padding:
              20px;

            color:
              #111;

          }

          .receipt-line {

            display:
              flex;

            justify-content:
              space-between;

            gap:
              20px;

            margin:
              8px 0;

          }

          button {

            display:
              none !important;

          }

          h2,
          p {

            text-align:
              center;

          }

          hr {

            border:
              0;

            border-top:
              1px dashed #999;

          }

        </style>

      </head>

      <body>

        ${receipt.innerHTML}

      </body>

    </html>

  `);


  printWindow.document.close();

  printWindow.focus();


  setTimeout(
    function() {

      printWindow.print();

    },
    300
  );

};


/* =========================================================
   BACKUP DATA
   ========================================================= */

window.backupData =
function() {

  const backup = {

    version:
      "2.0",

    createdAt:
      new Date().toISOString(),

    products:
      products,

    sales:
      sales,

    expenses:
      expenses,

    settings:
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
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;

  link.download =
    "my-store-pos-backup.json";


  document.body.appendChild(
    link
  );

  link.click();

  link.remove();


  URL.revokeObjectURL(
    url
  );

};


/* =========================================================
   RESTORE DATA
   ========================================================= */

window.restoreData =
function(input) {

  const file =
    input.files &&
    input.files[0];


  if (!file) return;


  const reader =
    new FileReader();


  reader.onload =
  function(event) {

    try {

      const backup =
        JSON.parse(
          event.target.result
        );


      if (
        !backup ||
        !Array.isArray(
          backup.products
        ) ||
        !Array.isArray(
          backup.sales
        )
      ) {

        throw new Error(
          "Invalid backup file."
        );

      }


      if (
        !confirm(
          "Restore this backup? Current data will be replaced."
        )
      ) {

        return;

      }


      products =
        backup.products || [];

      sales =
        backup.sales || [];

      expenses =
        backup.expenses || [];

      storeSettings = {

        ...storeSettings,

        ...(backup.settings || {})

      };


      saveData();

      saveSettings();


      location.reload();

    } catch (error) {

      alert(
        "Invalid backup file."
      );

      console.error(
        error
      );

    }

  };


  reader.readAsText(
    file
  );

};


/* =========================================================
   SEARCH EVENTS
   ========================================================= */

function setupSearch(
  id,
  callback
) {

  const input =
    document.getElementById(id);


  if (!input) return;


  input.addEventListener(
    "input",
    callback
  );

}


/* =========================================================
   GENERIC GET VALUE
   ========================================================= */

function getValue(id) {

  const element =
    document.getElementById(id);


  if (!element) {

    return "";

  }


  return element.value.trim();

}


function setValue(
  id,
  value
) {

  const element =
    document.getElementById(id);


  if (element) {

    element.value =
      value ?? "";

  }

}


function setText(
  id,
  value
) {

  const element =
    document.getElementById(id);


  if (element) {

    element.textContent =
      value;

  }

}


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    /* -----------------------------
       SETTINGS
    ----------------------------- */

    const saveSettingsButton =
      document.getElementById(
        "saveStoreButton"
      );


    if (saveSettingsButton) {

      saveSettingsButton.addEventListener(
        "click",
        window.saveStoreSettings
      );

    }


    /* -----------------------------
       ADD PRODUCT
    ----------------------------- */

    const addProductButton =
      document.getElementById(
        "addProductButton"
      );


    if (addProductButton) {

      addProductButton.addEventListener(
        "click",
        window.addProduct
      );

    }


    /* -----------------------------
       POS SEARCH
    ----------------------------- */

    setupSearch(
      "productSearch",
      renderPOSProducts
    );


    const saleType =
      document.getElementById(
        "saleType"
      );


    if (saleType) {

      saleType.addEventListener(
        "change",
        renderPOSProducts
      );

    }


    const posCategory =
      document.getElementById(
        "posCategory"
      );


    if (posCategory) {

      posCategory.addEventListener(
        "change",
        renderPOSProducts
      );

    }


    /* -----------------------------
       DISCOUNT
    ----------------------------- */

    const discount =
      document.getElementById(
        "discount"
      );


    if (discount) {

      discount.addEventListener(
        "input",
        renderCart
      );

    }


    /* -----------------------------
       PAYMENT
    ----------------------------- */

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


    /* -----------------------------
       COMPLETE SALE
    ----------------------------- */

    const completeSaleButton =
      document.getElementById(
        "completeSaleButton"
      );


    if (completeSaleButton) {

      completeSaleButton.addEventListener(
        "click",
        window.completeSale
      );

    }


    /* -----------------------------
       INVENTORY SEARCH
    ----------------------------- */

    setupSearch(
      "inventorySearch",
      function() {

        const query =
          getValue(
            "inventorySearch"
          ).toLowerCase();


        const container =
          document.getElementById(
            "inventoryList"
          );


        if (!container) return;


        const filtered =
          products.filter(
            function(product) {

              return (
                product.name
                  .toLowerCase()
                  .includes(query) ||

                String(
                  product.sku
                )
                  .toLowerCase()
                  .includes(query)

              );

            }
          );


        if (
          filtered.length === 0
        ) {

          container.innerHTML =
            `<div class="empty">
              No products found.
            </div>`;

          return;

        }


        container.innerHTML =
          filtered.map(
            function(product) {

              return `

                <div class="product-card">

                  <strong>
                    ${escapeHTML(
                      product.name
                    )}
                  </strong>

                  <small>
                    SKU:
                    ${escapeHTML(
                      product.sku
                    )}
                  </small>

                  <p>
                    Stock:
                    ${product.stock}
                  </p>

                  <p>
                    Retail:
                    ${money(
                      product.retailPrice
                    )}
                  </p>

                </div>

              `;

            }
          ).join("");

      }
    );


    /* -----------------------------
       CUSTOMER SEARCH
    ----------------------------- */

    setupSearch(
      "customerSearch",
      function() {

        const query =
          getValue(
            "customerSearch"
          ).toLowerCase();


        const customers =
          getCustomers().filter(
            function(customer) {

              return (

                customer.name
                  .toLowerCase()
                  .includes(query) ||

                customer.phone
                  .toLowerCase()
                  .includes(query)

              );

            }
          );


        const container =
          document.getElementById(
            "customersList"
          );


        if (!container) return;


        container.innerHTML =
          customers.map(
            function(customer) {

              return `

                <div class="history-card">

                  <h3>
                    👤
                    ${escapeHTML(
                      customer.name
                    )}
                  </h3>

                  <p>
                    ${escapeHTML(
                      customer.phone
                    )}
                  </p>

                  <p>
                    Purchases:
                    ${customer.purchases}
                  </p>

                  <p>
                    Total:
                    ${money(
                      customer.spent
                    )}
                  </p>

                </div>

              `;

            }
          ).join("");

      }
    );


    /* -----------------------------
       INITIAL RENDER
    ----------------------------- */

    loadSettingsForm();

    updateStoreTitle();

    updateDashboard();

    renderRecentSales();

    renderPOSProducts();

    renderCart();

    renderInventory();

    renderCustomers();

    renderSales();

    renderExpenses();

    renderReports();

  }
);
