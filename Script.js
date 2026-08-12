let products = [];
let sales = [];
let cart = [];

let storeSettings = {
  storeName: "My Store",
  ownerName: "",
  phone: "",
  email: "",
  address: "",
  city: ""
};


// ==========================================
// LOAD DATA
// ==========================================

try {
  products = JSON.parse(
    localStorage.getItem("posProducts")
  ) || [];
} catch (e) {
  products = [];
}

try {
  sales = JSON.parse(
    localStorage.getItem("posSales")
  ) || [];
} catch (e) {
  sales = [];
}

try {
  const saved = JSON.parse(
    localStorage.getItem("posStoreSettings")
  );

  if (saved) {
    storeSettings = {
      ...storeSettings,
      ...saved
    };
  }
} catch (e) {
  console.log("Settings could not be loaded.");
}


// ==========================================
// SAVE
// ==========================================

function saveData() {

  localStorage.setItem(
    "posProducts",
    JSON.stringify(products)
  );

  localStorage.setItem(
    "posSales",
    JSON.stringify(sales)
  );
}


function saveStoreSettings() {

  localStorage.setItem(
    "posStoreSettings",
    JSON.stringify(storeSettings)
  );
}


// ==========================================
// PAGE NAVIGATION
// ==========================================

window.openPage = function(pageId, clickedButton) {

  document
    .querySelectorAll(".page")
    .forEach(function(page) {
      page.classList.remove("active");
    });

  const page = document.getElementById(pageId);

  if (page) {
    page.classList.add("active");
  }

  document
    .querySelectorAll(".side-item, .mobile-nav-item")
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

  if (pageId === "homePage") {
    renderHomeSaleProducts();
    renderHomeCart();
  }
};


// ==========================================
// DOM READY
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  function() {

    const productName =
      document.getElementById("productName");

    const retailPrice =
      document.getElementById("productRetailPrice");

    const wholesalePrice =
      document.getElementById("productWholesalePrice");

    const productStock =
      document.getElementById("productStock");

    const addProductButton =
      document.getElementById("addProductButton");

    const productSearch =
      document.getElementById("productSearch");

    const inventorySearch =
      document.getElementById("inventorySearch");

    const saleType =
      document.getElementById("saleType");

    const customerName =
      document.getElementById("customerName");

    const customerPhone =
      document.getElementById("customerPhone");

    const amountPaid =
      document.getElementById("amountPaid");

    const completeSaleButton =
      document.getElementById("completeSaleButton");

    const customerSearch =
      document.getElementById("customerSearch");

    const storeNameInput =
      document.getElementById("storeName");

    const ownerNameInput =
      document.getElementById("ownerName");

    const storePhoneInput =
      document.getElementById("storePhone");

    const storeEmailInput =
      document.getElementById("storeEmail");

    const storeAddressInput =
      document.getElementById("storeAddress");

    const storeCityInput =
      document.getElementById("storeCity");

    const saveStoreButton =
      document.getElementById("saveStoreButton");


    // ========================================
    // STORE TITLE
    // ========================================

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

      document.title =
        name + " POS";
    }


    function loadStoreSettings() {

      if (storeNameInput) {
        storeNameInput.value =
          storeSettings.storeName || "";
      }

      if (ownerNameInput) {
        ownerNameInput.value =
          storeSettings.ownerName || "";
      }

      if (storePhoneInput) {
        storePhoneInput.value =
          storeSettings.phone || "";
      }

      if (storeEmailInput) {
        storeEmailInput.value =
          storeSettings.email || "";
      }

      if (storeAddressInput) {
        storeAddressInput.value =
          storeSettings.address || "";
      }

      if (storeCityInput) {
        storeCityInput.value =
          storeSettings.city || "";
      }

      updateStoreTitle();
    }


    // ========================================
    // SAVE STORE SETTINGS
    // ========================================

    if (saveStoreButton) {

      saveStoreButton.addEventListener(
        "click",
        function() {

          const name =
            storeNameInput
              ? storeNameInput.value.trim()
              : "";

          if (!name) {
            alert("Please enter a store name.");
            return;
          }

          storeSettings = {
            storeName: name,

            ownerName:
              ownerNameInput
                ? ownerNameInput.value.trim()
                : "",

            phone:
              storePhoneInput
                ? storePhoneInput.value.trim()
                : "",

            email:
              storeEmailInput
                ? storeEmailInput.value.trim()
                : "",

            address:
              storeAddressInput
                ? storeAddressInput.value.trim()
                : "",

            city:
              storeCityInput
                ? storeCityInput.value.trim()
                : ""
          };

          saveStoreSettings();
          updateStoreTitle();

          const message =
            document.getElementById(
              "storeSaveMessage"
            );

          if (message) {
            message.textContent =
              "✅ Business information saved.";

            setTimeout(function() {
              message.textContent = "";
            }, 3000);
          }
        }
      );
    }


    // ========================================
    // ADD PRODUCT
    // ========================================

    if (addProductButton) {

      addProductButton.addEventListener(
        "click",
        function() {

          const name =
            productName.value.trim();

          const retail =
            Number(retailPrice.value);

          const wholesale =
            Number(wholesalePrice.value);

          const stock =
            Number(productStock.value);

          if (!name) {
            alert("Please enter product name.");
            return;
          }

          if (retail <= 0) {
            alert("Please enter a valid retail price.");
            return;
          }

          if (wholesale <= 0) {
            alert("Please enter a valid wholesale price.");
            return;
          }

          if (stock < 0 || isNaN(stock)) {
            alert("Please enter a valid quantity.");
            return;
          }

          products.push({
            id: Date.now(),
            name: name,
            retailPrice: retail,
            wholesalePrice: wholesale,
            stock: stock
          });

          saveData();

          productName.value = "";
          retailPrice.value = "";
          wholesalePrice.value = "";
          productStock.value = "";

          showProducts();
          renderSaleProducts();
          renderHomeSaleProducts();

          alert("✅ Product added successfully!");
        }
      );
    }


    // ========================================
    // PRODUCTS
    // ========================================

    function productHTML(product, index) {

      const stock = Number(product.stock);

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

              <div class="product-price">
                Retail:
                ₦${Number(product.retailPrice).toLocaleString()}
              </div>

              <div class="product-price">
                Wholesale:
                ₦${Number(product.wholesalePrice).toLocaleString()}
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
        listData || products;

      if (data.length === 0) {

        list.innerHTML =
          '<p class="empty">No products added yet.</p>';

        updateDashboard();
        return;
      }

      list.innerHTML =
        data.map(function(product) {

          const originalIndex =
            products.indexOf(product);

          return productHTML(
            product,
            originalIndex
          );

        }).join("");

      updateDashboard();
    }


    window.deleteProduct =
      function(index) {

        const product = products[index];

        if (!product) return;

        if (
          !confirm(
            `Delete "${product.name}"?`
          )
        ) {
          return;
        }

        products.splice(index, 1);

        saveData();

        showProducts();
        renderSaleProducts();
        renderHomeSaleProducts();
      };


    // ========================================
    // SALE PRODUCTS
    // ========================================

    function renderSaleProducts() {

      const box =
        document.getElementById("saleProducts");

      if (!box) return;

      const search =
        productSearch
          ? productSearch.value
              .trim()
              .toLowerCase()
          : "";

      const type =
        saleType
          ? saleType.value
          : "retail";

      const results =
        products.filter(function(product) {

          return product.name
            .toLowerCase()
            .includes(search);

        });

      if (results.length === 0) {

        box.innerHTML =
          '<p class="empty">No matching product found.</p>';

        return;
      }

      box.innerHTML =
        results.map(function(product) {

          const index =
            products.indexOf(product);

          const price =
            type === "wholesale"
              ? Number(product.wholesalePrice)
              : Number(product.retailPrice);

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
                  ₦${price.toLocaleString()}
                  • Stock: ${product.stock}
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


    window.addToCart =
      function(index) {

        const product =
          products[index];

        if (!product) return;

        if (Number(product.stock) <= 0) {
          alert("This product is out of stock.");
          return;
        }

        const type =
          saleType
            ? saleType.value
            : "retail";

        addProductToCart(
          index,
          type
        );
      };


    function addProductToCart(index, type) {

      const product =
        products[index];

      if (!product) return;

      const price =
        type === "wholesale"
          ? Number(product.wholesalePrice)
          : Number(product.retailPrice);

      const existing =
        cart.find(function(item) {

          return (
            item.index === index &&
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
          index: index,
          name: product.name,
          price: price,
          quantity: 1,
          type: type
        });

      }

      renderCart();
      renderHomeCart();
    }


    // ========================================
    // CART
    // ========================================

    function getCartTotal() {

      return cart.reduce(
        function(total, item) {

          return total +
            item.price *
            item.quantity;

        },
        0
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
              item.price *
              item.quantity;

            return `
              <div class="cart-item">

                <div class="cart-row">

                  <strong>
                    ${escapeHTML(item.name)}
                  </strong>

                  <strong>
                    ₦${subtotal.toLocaleString()}
                  </strong>

                </div>

                <small>
                  ${
                    item.type === "wholesale"
                      ? "Wholesale"
                      : "Retail"
                  }
                  •
                  ₦${item.price.toLocaleString()}
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

      const total =
        getCartTotal();

      const cartTotal =
        document.getElementById("cartTotal");

      if (cartTotal) {
        cartTotal.textContent =
          "₦" + total.toLocaleString();
      }

      calculateChange();
    }


    window.increaseQuantity =
      function(index) {

        const item = cart[index];

        if (!item) return;

        const product =
          products[item.index];

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
        renderHomeCart();
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
        renderHomeCart();
      };


    window.removeFromCart =
      function(index) {

        cart.splice(index, 1);

        renderCart();
        renderHomeCart();
      };


    // ========================================
    // HOME SALE PANEL
    // ========================================

    function renderHomeSaleProducts() {

      const box =
        document.getElementById(
          "homeSaleProducts"
        );

      if (!box) return;

      const searchInput =
        document.getElementById(
          "homeProductSearch"
        );

      const typeSelect =
        document.getElementById(
          "homeSaleType"
        );

      const search =
        searchInput
          ? searchInput.value
              .trim()
              .toLowerCase()
          : "";

      const type =
        typeSelect
          ? typeSelect.value
          : "retail";

      const results =
        products.filter(function(product) {

          return product.name
            .toLowerCase()
            .includes(search);

        });

      if (results.length === 0) {

        box.innerHTML =
          '<p class="empty">No products found.</p>';

        return;
      }

      box.innerHTML =
        results.map(function(product) {

          const index =
            products.indexOf(product);

          const price =
            type === "wholesale"
              ? Number(product.wholesalePrice)
              : Number(product.retailPrice);

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
                  ₦${price.toLocaleString()}
                  • Stock: ${product.stock}
                </small>

              </div>

              <button
                class="add-button"
                onclick="addHomeToCart(${index})"
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


    window.addHomeToCart =
      function(index) {

        const typeSelect =
          document.getElementById(
            "homeSaleType"
          );

        const type =
          typeSelect
            ? typeSelect.value
            : "retail";

        addProductToCart(
          index,
          type
        );
      };


    function renderHomeCart() {

      const box =
        document.getElementById(
          "homeCart"
        );

      const totalBox =
        document.getElementById(
          "homeCartTotal"
        );

      if (!box) return;

      const total =
        getCartTotal();

      if (totalBox) {

        totalBox.textContent =
          "Total: ₦" +
          total.toLocaleString();
      }

      if (cart.length === 0) {

        box.innerHTML = `
          <div class="cart-empty-icon">
            🛒
          </div>

          <strong>Your cart is empty</strong>

          <small>
            Add products to get started
          </small>
        `;

        return;
      }

      box.innerHTML =
        cart.map(function(item, index) {

          return `
            <div
              style="
                width:100%;
                display:flex;
                justify-content:space-between;
                gap:10px;
                margin:5px 0;
              "
            >

              <span>
                ${escapeHTML(item.name)}
                × ${item.quantity}
              </span>

              <strong>
                ₦${(
                  item.price *
                  item.quantity
                ).toLocaleString()}
              </strong>

            </div>
          `;

        }).join("");
    }


    const homeSearch =
      document.getElementById(
        "homeProductSearch"
      );

    const homeType =
      document.getElementById(
        "homeSaleType"
      );

    if (homeSearch) {

      homeSearch.addEventListener(
        "input",
        renderHomeSaleProducts
      );

    }

    if (homeType) {

      homeType.addEventListener(
        "change",
        renderHomeSaleProducts
      );

    }


    // ========================================
    // SEARCH
    // ========================================

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

              return product.name
                .toLowerCase()
                .includes(query);

            });

          showProducts(filtered);
        }
      );

    }


    // ========================================
    // PAYMENT / CHANGE
    // ========================================

    function calculateChange() {

      const changeDisplay =
        document.getElementById(
          "changeDisplay"
        );

      if (!changeDisplay) return;

      const total =
        getCartTotal();

      const paid =
        amountPaid
          ? Number(amountPaid.value)
          : 0;

      if (
        paid <= 0 ||
        total <= 0
      ) {
        changeDisplay.innerHTML = "";
        return;
      }

      if (paid < total) {

        changeDisplay.innerHTML = `
          <strong style="color:#dc2626;">
            Amount remaining:
            ₦${(
              total - paid
            ).toLocaleString()}
          </strong>
        `;

      } else {

        changeDisplay.innerHTML = `
          <strong style="color:#168344;">
            Change:
            ₦${(
              paid - total
            ).toLocaleString()}
          </strong>
        `;
      }
    }


    if (amountPaid) {

      amountPaid.addEventListener(
        "input",
        calculateChange
      );

    }


    // ========================================
    // COMPLETE SALE
    // ========================================

    if (completeSaleButton) {

      completeSaleButton.addEventListener(
        "click",
        function() {

          if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
          }

          const name =
            customerName.value.trim();

          const phone =
            customerPhone.value.trim();

          if (!name) {
            alert("Please enter customer name.");
            return;
          }

          if (!phone) {
            alert(
              "Please enter customer phone number."
            );
            return;
          }

          const total =
            getCartTotal();

          const paid =
            Number(amountPaid.value);

          if (
            isNaN(paid) ||
            paid < total
          ) {

            alert(
              "Amount paid is not enough.\n\n" +
              "Total: ₦" +
              total.toLocaleString()
            );

            return;
          }

          const change =
            paid - total;

          const paymentMethod =
            document.getElementById(
              "paymentMethod"
            );

          const selectedPayment =
            paymentMethod
              ? paymentMethod.value
              : "Cash";


          // REDUCE STOCK

          cart.forEach(function(item) {

            if (products[item.index]) {

              products[item.index].stock -=
                item.quantity;

            }

          });


          // SAVE SALE

          const sale = {

            id: Date.now(),

            date:
              new Date().toISOString(),

            customerName:
              name,

            customerPhone:
              phone,

            paymentMethod:
              selectedPayment,

            items:
              cart.map(function(item) {

                return {
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  type: item.type
                };

              }),

            total: total,

            paid: paid,

            change: change

          };

          sales.unshift(sale);

          saveData();

          showReceipt(
            sale,
            selectedPayment
          );


          // RESET

          cart = [];

          customerName.value = "";
          customerPhone.value = "";
          amountPaid.value = "";

          if (paymentMethod) {
            paymentMethod.value = "Cash";
          }

          renderCart();
          renderHomeCart();
          showProducts();
          renderSaleProducts();
          renderHomeSaleProducts();
          showTodaySales();
          showSalesHistory();
          updateDashboard();

          alert(
            "✅ Sale completed successfully!"
          );
        }
      );
    }


    // ========================================
    // CUSTOMER SEARCH
    // ========================================

    if (customerSearch) {

      customerSearch.addEventListener(
        "input",
        showCustomerHistory
      );

    }


    function showCustomerHistory() {

      const box =
        document.getElementById(
          "customerHistory"
        );

      if (!box) return;

      const search =
        customerSearch.value
          .trim()
          .toLowerCase();

      if (!search) {

        box.innerHTML =
          '<p class="empty">Search for a customer to view history.</p>';

        return;
      }

      const found =
        sales.filter(function(sale) {

          const name =
            String(
              sale.customerName || ""
            ).toLowerCase();

          const phone =
            String(
              sale.customerPhone || ""
            ).toLowerCase();

          return (
            name.includes(search) ||
            phone.includes(search)
          );

        });

      if (found.length === 0) {

        box.innerHTML =
          '<p class="empty">No customer history found.</p>';

        return;
      }

      let totalSpent = 0;

      found.forEach(function(sale) {
        totalSpent += Number(sale.total);
      });

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
            <strong>Purchases:</strong>
            ${found.length}
          </p>

          <p>
            <strong>Total Spent:</strong>
            ₦${totalSpent.toLocaleString()}
          </p>

        </div>
      `;

      found.forEach(function(sale) {

        let items = "";

        sale.items.forEach(function(item) {

          items += `
            ${escapeHTML(item.name)}
            × ${item.quantity}
            —
            ₦${(
              item.price *
              item.quantity
            ).toLocaleString()}
            <br>
          `;

        });

        html += `
          <div class="history-card">

            <strong>
              📅
              ${new Date(
                sale.date
              ).toLocaleString()}
            </strong>

            <br><br>

            ${items}

            <br>

            <strong>
              Total:
              ₦${Number(
                sale.total
              ).toLocaleString()}
            </strong>

            <br>

            Payment:
            ${escapeHTML(
              sale.paymentMethod || "Cash"
            )}

          </div>
        `;
      });

      box.innerHTML = html;
    }


    // ========================================
    // SALES HISTORY
    // ========================================

    function showSalesHistory() {

      const box =
        document.getElementById(
          "salesHistory"
        );

      if (!box) return;

      if (sales.length === 0) {

        box.innerHTML =
          '<p class="empty">No sales yet.</p>';

        return;
      }

      box.innerHTML =
        sales.map(function(sale) {

          let items = "";

          sale.items.forEach(function(item) {

            items += `
              ${escapeHTML(item.name)}
              × ${item.quantity}
              <br>
            `;

          });

          return `
            <div class="history-card">

              <strong>
                🧾 Sale —
                ${new Date(
                  sale.date
                ).toLocaleString()}
              </strong>

              <br><br>

              Customer:
              ${escapeHTML(
                sale.customerName
              )}

              <br>

              Phone:
              ${escapeHTML(
                sale.customerPhone
              )}

              <br>

              Payment:
              ${escapeHTML(
                sale.paymentMethod || "Cash"
              )}

              <br><br>

              ${items}

              <br>

              <strong>
                Total:
                ₦${Number(
                  sale.total
                ).toLocaleString()}
              </strong>

              <br>

              Paid:
              ₦${Number(
                sale.paid
              ).toLocaleString()}

              <br>

              Change:
              ₦${Number(
                sale.change
              ).toLocaleString()}

            </div>
          `;

        }).join("");
    }


    // ========================================
    // TODAY SALES
    // ========================================

    function showTodaySales() {

      const today =
        new Date().toDateString();

      let total = 0;

      sales.forEach(function(sale) {

        if (
          new Date(sale.date)
            .toDateString() === today
        ) {
          total += Number(sale.total);
        }

      });

      const salesTotal =
        document.getElementById(
          "salesTotal"
        );

      if (salesTotal) {

        salesTotal.textContent =
          "₦" +
          total.toLocaleString();

      }
    }


    // ========================================
    // DASHBOARD
    // ========================================

    function updateDashboard() {

      const transactionCount =
        document.getElementById(
          "transactionCount"
        );

      const customerCount =
        document.getElementById(
          "customerCount"
        );

      const productCount =
        document.getElementById(
          "productCount"
        );

      const lowStock =
        document.getElementById(
          "lowStock"
        );

      if (transactionCount) {
        transactionCount.textContent =
          sales.length;
      }

      if (productCount) {
        productCount.textContent =
          products.length;
      }

      if (lowStock) {

        lowStock.textContent =
          products.filter(function(product) {

            return Number(product.stock) <= 5;

          }).length;
      }

      if (customerCount) {

        const customers =
          new Set();

        sales.forEach(function(sale) {

          if (sale.customerPhone) {

            customers.add(
              sale.customerPhone
            );

          } else if (sale.customerName) {

            customers.add(
              sale.customerName
            );

          }

        });

        customerCount.textContent =
          customers.size;
      }
    }


    // ========================================
    // RECEIPT
    // ========================================

    function showReceipt(
      sale,
      selectedPayment
    ) {

      const receipt =
        document.getElementById(
          "receipt"
        );

      if (!receipt) return;

      let receiptItems = "";

      sale.items.forEach(function(item) {

        const subtotal =
          item.price *
          item.quantity;

        receiptItems += `
          <div class="receipt-line">

            <span>
              ${escapeHTML(item.name)}
              × ${item.quantity}
            </span>

            <span>
              ₦${subtotal.toLocaleString()}
            </span>

          </div>
        `;
      });

      receipt.innerHTML = `

        <h2>
          ${escapeHTML(
            storeSettings.storeName ||
            "My Store"
          )}
        </h2>

        ${
          storeSettings.ownerName
            ? `<p>${escapeHTML(
                storeSettings.ownerName
              )}</p>`
            : ""
        }

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

        ${
          storeSettings.email
            ? `<p>${escapeHTML(
                storeSettings.email
              )}</p>`
            : ""
        }

        <p>
          <strong>SALES RECEIPT</strong>
        </p>

        <hr>

        <p>
          <strong>Customer:</strong>
          ${escapeHTML(
            sale.customerName
          )}
        </p>

        <p>
          <strong>Phone:</strong>
          ${escapeHTML(
            sale.customerPhone
          )}
        </p>

        <p>
          <strong>Payment:</strong>
          ${escapeHTML(
            selectedPayment
          )}
        </p>

        <p>
          <strong>Date:</strong>
          ${new Date(
            sale.date
          ).toLocaleString()}
        </p>

        <hr>

        ${receiptItems}

        <div class="receipt-total">

          <div class="receipt-line">
            <span>TOTAL</span>
            <span>
              ₦${sale.total.toLocaleString()}
            </span>
          </div>

          <div class="receipt-line">
            <span>PAID</span>
            <span>
              ₦${sale.paid.toLocaleString()}
            </span>
          </div>

          <div class="receipt-line">
            <span>CHANGE</span>
            <span>
              ₦${sale.change.toLocaleString()}
            </span>
          </div>

        </div>

        <p>
          Thank you for shopping with us! ❤️
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
            "Please allow pop-ups to print the receipt."
          );

          return;
        }

        printWindow.document.write(`
          <html>

          <head>

            <title>
              ${escapeHTML(
                storeSettings.storeName ||
                "Receipt"
              )}
            </title>

            <style>

              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                max-width: 400px;
                margin: auto;
                color: #111;
              }

              button {
                display: none !important;
              }

              .receipt-line {
                display: flex;
                justify-content: space-between;
                gap: 20px;
                margin: 10px 0;
              }

              .receipt-total {
                border-top: 1px dashed #777;
                padding-top: 10px;
                margin-top: 15px;
              }

              h2,
              p {
                text-align: center;
              }

              hr {
                border: 0;
                border-top: 1px solid #ddd;
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


    // ========================================
    // ADD PRODUCT BOX
    // ========================================

    window.showAddProduct =
      function() {

        const box =
          document.getElementById(
            "addProductBox"
          );

        if (!box) return;

        box.classList.toggle("hidden");
      };


    // ========================================
    // INITIAL LOAD
    // ========================================

    loadStoreSettings();

    showProducts();

    renderSaleProducts();

    renderHomeSaleProducts();

    renderCart();

    renderHomeCart();

    showTodaySales();

    showSalesHistory();

    updateDashboard();

  }
);


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
