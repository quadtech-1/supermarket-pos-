/* =========================================================
   MY STORE POS — V2
   Main application logic
========================================================= */

"use strict";

/* =========================================================
   STORAGE
========================================================= */

const STORAGE = {
  products: "posProducts",
  sales: "posSales",
  customers: "posCustomers",
  expenses: "posExpenses",
  settings: "posStoreSettings"
};


/* =========================================================
   DEFAULT DATA
========================================================= */

let products = [];
let sales = [];
let customers = [];
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
   LOAD STORAGE SAFELY
========================================================= */

function loadJSON(key, fallback) {

  try {

    const saved = localStorage.getItem(key);

    if (!saved) {
      return fallback;
    }

    return JSON.parse(saved);

  } catch (error) {

    console.warn("Could not load:", key);

    return fallback;
  }
}


products =
  loadJSON(STORAGE.products, []);

sales =
  loadJSON(STORAGE.sales, []);

customers =
  loadJSON(STORAGE.customers, []);

expenses =
  loadJSON(STORAGE.expenses, []);

const savedSettings =
  loadJSON(STORAGE.settings, null);

if (savedSettings) {

  storeSettings = {
    ...storeSettings,
    ...savedSettings
  };

}


/* =========================================================
   SAVE
========================================================= */

function saveProducts() {

  localStorage.setItem(
    STORAGE.products,
    JSON.stringify(products)
  );

}


function saveSales() {

  localStorage.setItem(
    STORAGE.sales,
    JSON.stringify(sales)
  );

}


function saveCustomers() {

  localStorage.setItem(
    STORAGE.customers,
    JSON.stringify(customers)
  );

}


function saveExpenses() {

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


function generateID(prefix) {

  return (
    prefix +
    "_" +
    Date.now() +
    "_" +
    Math.random()
      .toString(36)
      .substring(2, 8)
  );

}


function todayString() {

  return new Date().toDateString();

}


function isToday(date) {

  return (
    new Date(date).toDateString() ===
    todayString()
  );

}


function getProductCost(product) {

  return Number(
    product.costPrice ||
    product.wholesalePrice ||
    0
  );

}


function getProductSellingPrice(product, type) {

  if (type === "wholesale") {

    return Number(
      product.wholesalePrice ||
      product.retailPrice ||
      0
    );

  }

  return Number(
    product.retailPrice ||
    product.sellingPrice ||
    0
  );

}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

window.openPage = function(pageId, clickedButton) {

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
    .forEach(function(button) {

      button.classList.remove("active");

    });


  if (clickedButton) {

    clickedButton.classList.add("active");

  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  refreshCurrentPage(pageId);

};


/* =========================================================
   REFRESH PAGE
========================================================= */

function refreshCurrentPage(pageId) {

  if (pageId === "homePage") {

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

    renderSalesHistory();

  }

  if (pageId === "expensesPage") {

    renderExpenses();

  }

  if (pageId === "reportsPage") {

    renderReports();

  }

}


/* =========================================================
   STORE SETTINGS
========================================================= */

function updateStoreTitle() {

  const title =
    document.getElementById("appStoreName");

  const letter =
    document.getElementById("profileLetter");

  const name =
    storeSettings.storeName ||
    "My Store";


  if (title) {

    title.textContent = name;

  }


  if (letter) {

    letter.textContent =
      name.charAt(0).toUpperCase();

  }


  document.title =
    name + " POS";

}


function loadStoreSettings() {

  const fields = {

    storeName:
      document.getElementById("storeName"),

    ownerName:
      document.getElementById("ownerName"),

    phone:
      document.getElementById("storePhone"),

    email:
      document.getElementById("storeEmail"),

    address:
      document.getElementById("storeAddress"),

    city:
      document.getElementById("storeCity")

  };


  Object.keys(fields).forEach(function(key) {

    if (fields[key]) {

      fields[key].value =
        storeSettings[key] || "";

    }

  });


  updateStoreTitle();

}


function setupStoreSettings() {

  const button =
    document.getElementById(
      "saveStoreButton"
    );

  if (!button) return;


  button.addEventListener(
    "click",
    function() {

      const storeName =
        document
          .getElementById("storeName")
          ?.value
          .trim();


      if (!storeName) {

        alert(
          "Please enter a store name."
        );

        return;

      }


      storeSettings.storeName =
        storeName;

      storeSettings.ownerName =
        document
          .getElementById("ownerName")
          ?.value
          .trim() || "";

      storeSettings.phone =
        document
          .getElementById("storePhone")
          ?.value
          .trim() || "";

      storeSettings.email =
        document
          .getElementById("storeEmail")
          ?.value
          .trim() || "";

      storeSettings.address =
        document
          .getElementById("storeAddress")
          ?.value
          .trim() || "";

      storeSettings.city =
        document
          .getElementById("storeCity")
          ?.value
          .trim() || "";


      saveSettings();

      updateStoreTitle();


      const message =
        document.getElementById(
          "storeSaveMessage"
        );


      if (message) {

        message.textContent =
          "Business information saved.";

        setTimeout(function() {

          message.textContent = "";

        }, 3000);

      }

    }
  );

}


/* =========================================================
   PRODUCTS
========================================================= */

function addProduct() {

  const name =
    document
      .getElementById("productName")
      ?.value
      .trim();


  const cost =
    Number(
      document
        .getElementById("productCostPrice")
        ?.value || 0
    );


  const retail =
    Number(
      document
        .getElementById("productRetailPrice")
        ?.value || 0
    );


  const wholesale =
    Number(
      document
        .getElementById("productWholesalePrice")
        ?.value || 0
    );


  const stock =
    Number(
      document
        .getElementById("productStock")
        ?.value || 0
    );


  const category =
    document
      .getElementById("productCategory")
      ?.value
      .trim() || "General";


  const sku =
    document
      .getElementById("productSKU")
      ?.value
      .trim() || "";


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

    id: generateID("product"),

    name,

    costPrice: cost,

    retailPrice: retail,

    wholesalePrice:
      wholesale || retail,

    stock,

    category,

    sku,

    createdAt:
      new Date().toISOString()

  });


  saveProducts();

  clearProductForm();

  renderInventory();

  renderPOSProducts();

  updateDashboard();


  alert("Product added successfully.");

}


window.addProduct = addProduct;


function clearProductForm() {

  [
    "productName",
    "productCostPrice",
    "productRetailPrice",
    "productWholesalePrice",
    "productStock",
    "productCategory",
    "productSKU"
  ].forEach(function(id) {

    const field =
      document.getElementById(id);

    if (field) {

      field.value = "";

    }

  });

}


/* =========================================================
   INVENTORY
========================================================= */

function renderInventory() {

  const box =
    document.getElementById(
      "productList"
    );


  if (!box) return;


  const search =
    document
      .getElementById("inventorySearch")
      ?.value
      .trim()
      .toLowerCase() || "";


  const filtered =
    products.filter(function(product) {

      return (

        product.name
          .toLowerCase()
          .includes(search)

        ||

        String(product.sku || "")
          .toLowerCase()
          .includes(search)

        ||

        String(product.category || "")
          .toLowerCase()
          .includes(search)

      );

    });


  if (!filtered.length) {

    box.innerHTML =
      '<p class="empty">No products found.</p>';

    return;

  }


  box.innerHTML =
    filtered.map(function(product) {

      const stock =
        Number(product.stock || 0);


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

              <div class="product-name">

                ${escapeHTML(
                  product.name
                )}

              </div>

              <small>

                ${escapeHTML(
                  product.category ||
                  "General"
                )}

              </small>

              ${
                product.sku
                  ? `
                    <small>
                      SKU:
                      ${escapeHTML(
                        product.sku
                      )}
                    </small>
                  `
                  : ""
              }

            </div>

            <strong>
              ${stock}
            </strong>

          </div>


          <div class="product-price">

            Cost:
            ${money(
              getProductCost(product)
            )}

          </div>


          <div class="product-price">

            Retail:
            ${money(
              product.retailPrice
            )}

          </div>


          <div class="product-price">

            Wholesale:
            ${money(
              product.wholesalePrice
            )}

          </div>


          <div class="stock">

            ${status}

          </div>


          <button
            onclick="deleteProduct('${product.id}')"
          >
            Delete
          </button>

        </div>

      `;

    }).join("");

}


window.renderInventory =
  renderInventory;


window.deleteProduct =
  function(id) {

    const product =
      products.find(function(item) {

        return item.id === id;

      });


    if (!product) return;


    if (
      !confirm(
        'Delete "' +
        product.name +
        '"?'
      )
    ) {

      return;

    }


    products =
      products.filter(function(item) {

        return item.id !== id;

      });


    saveProducts();

    renderInventory();

    renderPOSProducts();

    updateDashboard();

  };


/* =========================================================
   POS PRODUCTS
========================================================= */

function renderPOSProducts() {

  const box =
    document.getElementById(
      "saleProducts"
    ) ||
    document.getElementById(
      "homeSaleProducts"
    );


  if (!box) return;


  const search =
    document
      .getElementById("productSearch")
      ?.value
      .trim()
      .toLowerCase() || "";


  const category =
    document
      .getElementById("saleCategory")
      ?.value || "all";


  const type =
    document
      .getElementById("saleType")
      ?.value || "retail";


  const filtered =
    products.filter(function(product) {

      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(search);


      const matchesCategory =
        category === "all" ||
        product.category === category;


      return (
        matchesSearch &&
        matchesCategory
      );

    });


  if (!filtered.length) {

    box.innerHTML =
      '<p class="empty">No products found.</p>';

    return;

  }


  box.innerHTML =
    filtered.map(function(product) {

      const index =
        products.indexOf(product);


      const price =
        getProductSellingPrice(
          product,
          type
        );


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

              ${money(price)}
              • Stock:
              ${product.stock}

            </small>

          </div>


          <button
            class="add-button"
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

    }).join("");

}


window.renderPOSProducts =
  renderPOSProducts;


window.addToCart =
  function(index) {

    const product =
      products[index];


    if (!product) return;


    if (
      Number(product.stock) <= 0
    ) {

      alert(
        "This product is out of stock."
      );

      return;

    }


    const type =
      document
        .getElementById("saleType")
        ?.value || "retail";


    const price =
      getProductSellingPrice(
        product,
        type
      );


    const existing =
      cart.find(function(item) {

        return (
          item.productId === product.id
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

        productId:
          product.id,

        name:
          product.name,

        price,

        costPrice:
          getProductCost(product),

        quantity: 1,

        type

      });

    }


    renderCart();

};


/* =========================================================
   CART
========================================================= */

function getCartSubtotal() {

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


function getCartDiscount() {

  const discount =
    Number(
      document
        .getElementById("discount")
        ?.value || 0
    );


  return Math.max(
    0,
    Math.min(
      discount,
      getCartSubtotal()
    )
  );

}


function getCartTotal() {

  return (
    getCartSubtotal() -
    getCartDiscount()
  );

}


function renderCart() {

  const box =
    document.getElementById("cart");


  if (!box) return;


  if (!cart.length) {

    box.innerHTML =
      '<p class="empty">Cart is empty.</p>';

  } else {

    box.innerHTML =
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

              ${item.type === "wholesale"
                ? "Wholesale"
                : "Retail"}

              •
              ${money(item.price)}

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


  const subtotal =
    document.getElementById(
      "cartSubtotal"
    );


  const discount =
    document.getElementById(
      "cartDiscount"
    );


  const total =
    document.getElementById(
      "cartTotal"
    );


  if (subtotal) {

    subtotal.textContent =
      money(getCartSubtotal());

  }


  if (discount) {

    discount.textContent =
      money(getCartDiscount());

  }


  if (total) {

    total.textContent =
      money(getCartTotal());

  }


  calculateChange();

}


window.increaseQuantity =
  function(index) {

    const item =
      cart[index];


    if (!item) return;


    const product =
      products.find(function(product) {

        return (
          product.id ===
          item.productId
        );

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


window.decreaseQuantity =
  function(index) {

    if (!cart[index]) return;


    if (
      cart[index].quantity > 1
    ) {

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
   DISCOUNT
========================================================= */

function setupDiscount() {

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

}


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
    Number(
      document
        .getElementById("amountPaid")
        ?.value || 0
    );


  if (
    !paid ||
    !total
  ) {

    display.innerHTML = "";

    return;

  }


  if (paid < total) {

    display.innerHTML = `

      <strong style="color:#dc2626">

        Amount remaining:
        ${money(total - paid)}

      </strong>

    `;

  } else {

    display.innerHTML = `

      <strong style="color:#168344">

        Change:
        ${money(paid - total)}

      </strong>

    `;

  }

}


function setupPayment() {

  const input =
    document.getElementById(
      "amountPaid"
    );


  if (input) {

    input.addEventListener(
      "input",
      calculateChange
    );

  }

}


/* =========================================================
   COMPLETE SALE
========================================================= */

function completeSale() {

  if (!cart.length) {

    alert("Your cart is empty.");

    return;

  }


  const customerName =
    document
      .getElementById("customerName")
      ?.value
      .trim() || "Walk-in Customer";


  const customerPhone =
    document
      .getElementById("customerPhone")
      ?.value
      .trim() || "";


  const paymentMethod =
    document
      .getElementById("paymentMethod")
      ?.value || "Cash";


  const total =
    getCartTotal();


  const paid =
    Number(
      document
        .getElementById("amountPaid")
        ?.value || 0
    );


  if (paid < total) {

    alert(
      "Amount paid is not enough.\n\n" +
      "Total: " +
      money(total)
    );

    return;

  }


  const discount =
    getCartDiscount();


  let cost =
    0;


  cart.forEach(function(item) {

    cost +=
      item.costPrice *
      item.quantity;

  });


  const grossProfit =
    total - cost;


  const change =
    paid - total;


  /* REDUCE STOCK */

  cart.forEach(function(item) {

    const product =
      products.find(function(product) {

        return (
          product.id ===
          item.productId
        );

      });


    if (product) {

      product.stock =
        Number(product.stock) -
        item.quantity;

    }

  });


  /* CUSTOMER */

  if (customerName !== "Walk-in Customer") {

    let customer =
      customers.find(function(item) {

        return (
          (
            customerPhone &&
            item.phone ===
            customerPhone
          ) ||

          (
            item.name ===
            customerName
          )
        );

      });


    if (!customer) {

      customer = {

        id:
          generateID("customer"),

        name:
          customerName,

        phone:
          customerPhone,

        totalSpent: 0,

        purchases: 0,

        createdAt:
          new Date().toISOString()

      };


      customers.push(customer);

    }


    customer.totalSpent += total;

    customer.purchases++;

  }


  const sale = {

    id:
      generateID("sale"),

    date:
      new Date().toISOString(),

    customerName,

    customerPhone,

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
            item.quantity,

          type:
            item.type

        };

      }),

    subtotal:
      getCartSubtotal(),

    discount,

    total,

    cost,

    grossProfit,

    paid,

    change

  };


  sales.unshift(sale);


  saveProducts();

  saveSales();

  saveCustomers();


  showReceipt(sale);


  cart = [];


  clearSaleForm();


  renderCart();

  renderPOSProducts();

  renderInventory();

  updateDashboard();

  renderRecentSales();

  renderSalesHistory();

  renderCustomers();

  renderReports();


  alert(
    "Sale completed successfully."
  );

}


window.completeSale =
  completeSale;


function clearSaleForm() {

  [
    "customerName",
    "customerPhone",
    "amountPaid",
    "discount"
  ].forEach(function(id) {

    const field =
      document.getElementById(id);

    if (field) {

      field.value = "";

    }

  });


  const payment =
    document.getElementById(
      "paymentMethod"
    );


  if (payment) {

    payment.value = "Cash";

  }


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


  let items = "";


  sale.items.forEach(function(item) {

    items += `

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

  });


  receipt.innerHTML = `

    <h2>

      ${escapeHTML(
        storeSettings.storeName
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
      storeSettings.city
        ? `<p>${escapeHTML(
            storeSettings.city
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


    <p>
      <strong>SALES RECEIPT</strong>
    </p>


    <hr>


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

      <strong>Subtotal</strong>

      <strong>
        ${money(sale.subtotal)}
      </strong>

    </div>


    <div class="receipt-line">

      <span>Discount</span>

      <span>
        ${money(sale.discount)}
      </span>

    </div>


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

          </style>

        </head>


        <body>

          ${receipt.innerHTML}

        </body>

      </html>

    `);


    printWindow.document.close();

    printWindow.focus();


    setTimeout(function() {

      printWindow.print();

    }, 300);

  };


/* =========================================================
   SALES HISTORY
========================================================= */

function renderSalesHistory() {

  const box =
    document.getElementById(
      "salesHistory"
    );


  if (!box) return;


  if (!sales.length) {

    box.innerHTML =
      '<p class="empty">No sales yet.</p>';

    return;

  }


  box.innerHTML =
    sales.map(function(sale) {

      return `

        <div class="history-card">

          <strong>

            🧾 Sale

          </strong>


          <small>

            ${new Date(
              sale.date
            ).toLocaleString()}

          </small>


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

            Items:
            ${sale.items.length}

          </p>


          <p>

            Profit:
            ${money(
              sale.grossProfit
            )}

          </p>


          <strong>

            Total:
            ${money(sale.total)}

          </strong>

        </div>

      `;

    }).join("");

}


/* =========================================================
   CUSTOMERS
========================================================= */

function renderCustomers() {

  const box =
    document.getElementById(
      "customerList"
    );


  if (!box) return;


  if (!customers.length) {

    box.innerHTML =
      '<p class="empty">No customers yet.</p>';

    return;

  }


  box.innerHTML =
    customers.map(function(customer) {

      return `

        <div class="history-card">

          <h3>

            ${escapeHTML(
              customer.name
            )}

          </h3>


          <p>

            Phone:
            ${escapeHTML(
              customer.phone ||
              "Not provided"
            )}

          </p>


          <p>

            Purchases:
            ${customer.purchases}

          </p>


          <strong>

            Total spent:
            ${money(
              customer.totalSpent
            )}

          </strong>

        </div>

      `;

    }).join("");

}


/* =========================================================
   EXPENSES
========================================================= */

function addExpense() {

  const title =
    document
      .getElementById("expenseName")
      ?.value
      .trim();


  const category =
    document
      .getElementById("expenseCategory")
      ?.value
      .trim() || "General";


  const amount =
    Number(
      document
        .getElementById("expenseAmount")
        ?.value || 0
    );


  const notes =
    document
      .getElementById("expenseNotes")
      ?.value
      .trim() || "";


  if (!title) {

    alert("Enter expense name.");

    return;

  }


  if (amount <= 0) {

    alert("Enter a valid expense amount.");

    return;

  }


  expenses.unshift({

    id:
      generateID("expense"),

    title,

    category,

    amount,

    notes,

    date:
      new Date().toISOString()

  });


  saveExpenses();


  [
    "expenseName",
    "expenseAmount",
    "expenseNotes"
  ].forEach(function(id) {

    const field =
      document.getElementById(id);

    if (field) {

      field.value = "";

    }

  });


  renderExpenses();

  updateDashboard();

  renderReports();

}


window.addExpense =
  addExpense;


function renderExpenses() {

  const box =
    document.getElementById(
      "expenseList"
    );


  if (!box) return;


  if (!expenses.length) {

    box.innerHTML =
      '<p class="empty">No expenses recorded.</p>';

    return;

  }


  box.innerHTML =
    expenses.map(function(expense) {

      return `

        <div class="history-card">

          <strong>

            ${escapeHTML(
              expense.title
            )}

          </strong>


          <p>

            Category:
            ${escapeHTML(
              expense.category
            )}

          </p>


          <p>

            ${money(
              expense.amount
            )}

          </p>


          <small>

            ${new Date(
              expense.date
            ).toLocaleString()}

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

            Delete

          </button>

        </div>

      `;

    }).join("");

}


window.deleteExpense =
  function(id) {

    expenses =
      expenses.filter(function(expense) {

        return expense.id !== id;

      });


    saveExpenses();

    renderExpenses();

    updateDashboard();

    renderReports();

  };


/* =========================================================
   FINANCIAL CALCULATIONS
========================================================= */

function getRevenue() {

  return sales.reduce(
    function(total, sale) {

      return total +
        Number(sale.total || 0);

    },
    0
  );

}


function getCost() {

  return sales.reduce(
    function(total, sale) {

      return total +
        Number(sale.cost || 0);

    },
    0
  );

}


function getGrossProfit() {

  return (
    getRevenue() -
    getCost()
  );

}


function getExpenses() {

  return expenses.reduce(
    function(total, expense) {

      return total +
        Number(expense.amount || 0);

    },
    0
  );

}


function getNetProfit() {

  return (
    getGrossProfit() -
    getExpenses()
  );

}


function getTodayRevenue() {

  return sales.reduce(
    function(total, sale) {

      if (isToday(sale.date)) {

        return total +
          Number(sale.total || 0);

      }

      return total;

    },
    0
  );

}


function getTodayExpenses() {

  return expenses.reduce(
    function(total, expense) {

      if (isToday(expense.date)) {

        return total +
          Number(expense.amount || 0);

      }

      return total;

    },
    0
  );

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

  const values = {

    revenue:
      getTodayRevenue(),

    grossProfit:
      sales
        .filter(function(sale) {

          return isToday(sale.date);

        })
        .reduce(function(total, sale) {

          return total +
            Number(
              sale.grossProfit || 0
            );

        }, 0),

    expenses:
      getTodayExpenses(),

    netProfit:
      sales
        .filter(function(sale) {

          return isToday(sale.date);

        })
        .reduce(function(total, sale) {

          return total +
            Number(
              sale.grossProfit || 0
            );

        }, 0) -
      getTodayExpenses(),

    transactions:
      sales.length,

    products:
      products.length,

    lowStock:
      products.filter(function(product) {

        return Number(
          product.stock || 0
        ) <= 5;

      }).length,

    customers:
      customers.length

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
      "lowStock",

    customers:
      "customerCount"

  };


  Object.keys(ids).forEach(function(key) {

    const element =
      document.getElementById(
        ids[key]
      );


    if (!element) return;


    if (
      [
        "revenue",
        "grossProfit",
        "expenses",
        "netProfit"
      ].includes(key)
    ) {

      element.textContent =
        money(values[key]);

    } else {

      element.textContent =
        values[key];

    }

  });


  const salesTotal =
    document.getElementById(
      "salesTotal"
    );


  if (salesTotal) {

    salesTotal.textContent =
      money(getTodayRevenue());

  }


  renderRecentSales();

}


/* =========================================================
   RECENT SALES
========================================================= */

function renderRecentSales() {

  const box =
    document.getElementById(
      "recentSales"
    );


  if (!box) return;


  const recent =
    sales.slice(0, 5);


  if (!recent.length) {

    box.innerHTML =
      '<p class="empty">No recent sales.</p>';

    return;

  }


  box.innerHTML =
    recent.map(function(sale) {

      return `

        <div class="history-card">

          <strong>

            ${escapeHTML(
              sale.customerName
            )}

          </strong>


          <span>

            ${money(
              sale.total
            )}

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
   REPORTS
========================================================= */

function renderReports() {

  const values = {

    revenue:
      getRevenue(),

    cost:
      getCost(),

    grossProfit:
      getGrossProfit(),

    expenses:
      getExpenses(),

    netProfit:
      getNetProfit()

  };


  const ids = {

    reportRevenue:
      "revenue",

    reportCost:
      "cost",

    reportGrossProfit:
      "grossProfit",

    reportExpenses:
      "expenses",

    reportNetProfit:
      "netProfit"

  };


  Object.keys(ids).forEach(function(id) {

    const element =
      document.getElementById(id);


    if (!element) return;


    element.textContent =
      money(values[ids[id]]);

  });


  renderBestSellingProducts();

}


function renderBestSellingProducts() {

  const box =
    document.getElementById(
      "bestSellingProducts"
    );


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

      })
      .slice(0, 10);


  if (!ranking.length) {

    box.innerHTML =
      '<p class="empty">No sales data yet.</p>';

    return;

  }


  box.innerHTML =
    ranking.map(function(item, index) {

      return `

        <div class="history-card">

          <strong>

            #${index + 1}
            ${escapeHTML(item[0])}

          </strong>


          <span>

            ${item[1]} sold

          </span>

        </div>

      `;

    }).join("");

}


/* =========================================================
   BACKUP
========================================================= */

window.exportData =
  function() {

    const backup = {

      version: 2,

      exportedAt:
        new Date().toISOString(),

      products,

      sales,

      customers,

      expenses,

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
      (
        storeSettings.storeName ||
        "my-store"
      )
      .replace(/\s+/g, "-")
      .toLowerCase() +
      "-backup.json";


    link.click();


    URL.revokeObjectURL(url);

  };


/* =========================================================
   RESTORE
========================================================= */

window.importData =
  function(input) {

    const file =
      input.files?.[0];


    if (!file) return;


    const reader =
      new FileReader();


    reader.onload =
      function(event) {

        try {

          const data =
            JSON.parse(
              event.target.result
            );


          if (!data) {

            throw new Error(
              "Invalid backup."
            );

          }


          if (
            !confirm(
              "Restore this backup? Existing data will be replaced."
            )
          ) {

            return;

          }


          products =
            Array.isArray(
              data.products
            )
              ? data.products
              : [];


          sales =
            Array.isArray(
              data.sales
            )
              ? data.sales
              : [];


          customers =
            Array.isArray(
              data.customers
            )
              ? data.customers
              : [];


          expenses =
            Array.isArray(
              data.expenses
            )
              ? data.expenses
              : [];


          if (data.storeSettings) {

            storeSettings = {

              ...storeSettings,

              ...data.storeSettings

            };

          }


          saveProducts();

          saveSales();

          saveCustomers();

          saveExpenses();

          saveSettings();


          loadStoreSettings();

          renderInventory();

          renderPOSProducts();

          renderCart();

          renderCustomers();

          renderSalesHistory();

          renderExpenses();

          renderReports();

          updateDashboard();


          alert(
            "Backup restored successfully."
          );


        } catch (error) {

          alert(
            "Could not restore this backup."
          );

        }

      };


    reader.readAsText(file);

  };


/* =========================================================
   ADD PRODUCT BOX
========================================================= */

window.showAddProduct =
  function() {

    const box =
      document.getElementById(
        "addProductBox"
      );


    if (!box) return;


    box.classList.toggle(
      "hidden"
    );

  };


/* =========================================================
   SEARCH LISTENERS
========================================================= */

function setupSearch() {

  const inventorySearch =
    document.getElementById(
      "inventorySearch"
    );


  if (inventorySearch) {

    inventorySearch.addEventListener(
      "input",
      renderInventory
    );

  }


  const productSearch =
    document.getElementById(
      "productSearch"
    );


  if (productSearch) {

    productSearch.addEventListener(
      "input",
      renderPOSProducts
    );

  }


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


  const saleCategory =
    document.getElementById(
      "saleCategory"
    );


  if (saleCategory) {

    saleCategory.addEventListener(
      "change",
      renderPOSProducts
    );

  }

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    setupStoreSettings();

    setupSearch();

    setupDiscount();

    setupPayment();

    loadStoreSettings();

    renderInventory();

    renderPOSProducts();

    renderCart();

    renderCustomers();

    renderSalesHistory();

    renderExpenses();

    renderReports();

    updateDashboard();

  }
);
