let products = [];
let sales = [];
let cart = [];


// ===============================
// STORE SETTINGS
// ===============================

let storeSettings = {

  storeName: "My Supermarket POS",

  ownerName: "",

  phone: "",

  address: ""

};


// ===============================
// LOAD SAVED DATA
// ===============================

try {

  products =
    JSON.parse(
      localStorage.getItem("posProducts")
    ) || [];

} catch (e) {

  products = [];

}


try {

  sales =
    JSON.parse(
      localStorage.getItem("posSales")
    ) || [];

} catch (e) {

  sales = [];

}


try {

  const savedSettings =
    JSON.parse(
      localStorage.getItem("posStoreSettings")
    );

  if (savedSettings) {

    storeSettings = {

      ...storeSettings,

      ...savedSettings

    };

  }

} catch (e) {

  console.log(
    "Store settings could not be loaded."
  );

}


// ===============================
// START
// ===============================

document.addEventListener(
  "DOMContentLoaded",
  function () {


    // ===============================
    // ELEMENTS
    // ===============================

    const productName =
      document.getElementById(
        "productName"
      );

    const retailPrice =
      document.getElementById(
        "productRetailPrice"
      );

    const wholesalePrice =
      document.getElementById(
        "productWholesalePrice"
      );

    const productStock =
      document.getElementById(
        "productStock"
      );

    const addProductButton =
      document.getElementById(
        "addProductButton"
      );

    const productSearch =
      document.getElementById(
        "productSearch"
      );

    const saleType =
      document.getElementById(
        "saleType"
      );

    const customerName =
      document.getElementById(
        "customerName"
      );

    const customerPhone =
      document.getElementById(
        "customerPhone"
      );

    const amountPaid =
      document.getElementById(
        "amountPaid"
      );

    const completeSaleButton =
      document.getElementById(
        "completeSaleButton"
      );

    const customerSearch =
      document.getElementById(
        "customerSearch"
      );


    // STORE SETTINGS ELEMENTS

    const storeNameInput =
      document.getElementById(
        "storeName"
      );

    const ownerNameInput =
      document.getElementById(
        "ownerName"
      );

    const storePhoneInput =
      document.getElementById(
        "storePhone"
      );

    const storeAddressInput =
      document.getElementById(
        "storeAddress"
      );

    const saveStoreButton =
      document.getElementById(
        "saveStoreButton"
      );


    // ===============================
    // SAVE DATA
    // ===============================

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


    // ===============================
    // STORE SETTINGS
    // ===============================

    function saveStoreSettings() {

      localStorage.setItem(
        "posStoreSettings",
        JSON.stringify(
          storeSettings
        )
      );

    }


    function loadStoreSettings() {

      storeNameInput.value =
        storeSettings.storeName;

      ownerNameInput.value =
        storeSettings.ownerName;

      storePhoneInput.value =
        storeSettings.phone;

      storeAddressInput.value =
        storeSettings.address;


      updateStoreTitle();

    }


    function updateStoreTitle() {

      const title =
        document.getElementById(
          "appStoreName"
        );

      title.textContent =
        "🛒 " +
        (
          storeSettings.storeName ||
          "My Supermarket POS"
        );

    }


    saveStoreButton.addEventListener(
      "click",
      function () {

        const name =
          storeNameInput.value.trim();

        if (name === "") {

          alert(
            "Please enter a store name."
          );

          return;

        }


        storeSettings = {

          storeName:
            name,

          ownerName:
            ownerNameInput.value.trim(),

          phone:
            storePhoneInput.value.trim(),

          address:
            storeAddressInput.value.trim()

        };


        saveStoreSettings();

        updateStoreTitle();


        const message =
          document.getElementById(
            "storeSaveMessage"
          );


        message.textContent =
          "✅ Store information saved!";


        setTimeout(
          function () {

            message.textContent = "";

          },
          3000
        );

      }
    );


    // ===============================
    // ADD PRODUCT
    // ===============================

    addProductButton.addEventListener(
      "click",
      function () {

        const name =
          productName.value.trim();

        const retail =
          Number(
            retailPrice.value
          );

        const wholesale =
          Number(
            wholesalePrice.value
          );

        const stock =
          Number(
            productStock.value
          );


        if (name === "") {

          alert(
            "Please enter product name."
          );

          return;

        }


        if (retail <= 0) {

          alert(
            "Please enter retail price."
          );

          return;

        }


        if (wholesale <= 0) {

          alert(
            "Please enter wholesale price."
          );

          return;

        }


        if (
          stock < 0 ||
          isNaN(stock)
        ) {

          alert(
            "Please enter quantity."
          );

          return;

        }


        products.push({

          name:
            name,

          retailPrice:
            retail,

          wholesalePrice:
            wholesale,

          stock:
            stock

        });


        saveData();


        productName.value = "";

        retailPrice.value = "";

        wholesalePrice.value = "";

        productStock.value = "";


        showProducts();

        showSaleProducts();


        alert(
          "✅ Product added successfully!"
        );

      }
    );


    // ===============================
    // SHOW PRODUCTS
    // ===============================

    function showProducts() {

      const list =
        document.getElementById(
          "productList"
        );


      list.innerHTML = "";


      if (
        products.length === 0
      ) {

        list.innerHTML =
          '<p class="muted">' +
          'No products added yet.' +
          '</p>';

      }


      products.forEach(
        function (product) {

          list.innerHTML += `

            <div class="product">

              <strong>
                ${product.name}
              </strong>

              <br><br>

              Retail:
              ₦${Number(
                product.retailPrice
              ).toLocaleString()}

              <br>

              Wholesale:
              ₦${Number(
                product.wholesalePrice
              ).toLocaleString()}

              <br>

              Stock:
              ${product.stock}

            </div>

          `;

        }
      );


      document.getElementById(
        "productCount"
      ).textContent =
        products.length;


      const lowStock =
        products.filter(
          function (product) {

            return (
              Number(
                product.stock
              ) <= 5
            );

          }
        ).length;


      document.getElementById(
        "lowStock"
      ).textContent =
        lowStock;

    }


    // ===============================
    // TODAY'S SALES
    // ===============================

    function showTodaySales() {

      const today =
        new Date().toDateString();

      let total = 0;


      sales.forEach(
        function (sale) {

          if (
            new Date(
              sale.date
            ).toDateString()
            === today
          ) {

            total +=
              Number(
                sale.total
              );

          }

        }
      );


      document.getElementById(
        "salesTotal"
      ).textContent =
        "₦" +
        total.toLocaleString();

    }


    // ===============================
    // PRODUCT SEARCH
    // ===============================

    productSearch.addEventListener(
      "input",
      function () {

        showSaleProducts();

      }
    );


    saleType.addEventListener(
      "change",
      function () {

        showSaleProducts();

      }
    );


    // ===============================
    // SHOW SALE PRODUCTS
    // ===============================

    function showSaleProducts() {

      const box =
        document.getElementById(
          "saleProducts"
        );


      const search =
        productSearch.value
          .trim()
          .toLowerCase();


      box.innerHTML = "";


      const results =
        products.filter(
          function (product) {

            return product.name
              .toLowerCase()
              .includes(search);

          }
        );


      if (
        results.length === 0
      ) {

        box.innerHTML =
          '<p class="muted">' +
          'No matching product found.' +
          '</p>';

        return;

      }


      results.forEach(
        function (product) {

          const index =
            products.indexOf(
              product
            );


          let price;


          if (
            saleType.value
            === "wholesale"
          ) {

            price =
              Number(
                product.wholesalePrice
              );

          } else {

            price =
              Number(
                product.retailPrice
              );

          }


          box.innerHTML += `

            <div class="product">

              <strong>
                ${product.name}
              </strong>

              <br>

              Price:
              ₦${price.toLocaleString()}

              <br>

              Stock:
              ${product.stock}

              <br>

              <button
                onclick="addToCart(${index})"
              >
                🛒 Add to Cart
              </button>

            </div>

          `;

        }
      );

    }


    // ===============================
    // ADD TO CART
    // ===============================

    window.addToCart =
      function (index) {

        const product =
          products[index];


        if (!product) {

          return;

        }


        if (
          Number(
            product.stock
          ) <= 0
        ) {

          alert(
            "This product is out of stock."
          );

          return;

        }


        const type =
          saleType.value;


        const price =
          type === "wholesale"

            ? Number(
                product.wholesalePrice
              )

            : Number(
                product.retailPrice
              );


        const existing =
          cart.find(
            function (item) {

              return (
                item.index === index &&
                item.type === type
              );

            }
          );


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

            index:
              index,

            name:
              product.name,

            price:
              price,

            quantity:
              1,

            type:
              type

          });

        }


        showCart();

      };


    // ===============================
    // SHOW CART
    // ===============================

    function showCart() {

      const box =
        document.getElementById(
          "cart"
        );


      box.innerHTML = "";


      let total = 0;


      if (
        cart.length === 0
      ) {

        box.innerHTML =
          '<p class="muted">' +
          'Cart is empty.' +
          '</p>';

      }


      cart.forEach(
        function (item, index) {

          const subtotal =
            item.price *
            item.quantity;


          total += subtotal;


          box.innerHTML += `

            <div class="product">

              <strong>
                ${item.name}
              </strong>

              <br>

              ${
                item.type === "wholesale"
                ? "Wholesale"
                : "Retail"
              }

              <br>

              ₦${item.price.toLocaleString()}
              × ${item.quantity}

              <br>

              Subtotal:
              ₦${subtotal.toLocaleString()}

              <br><br>

              <button
                onclick="decreaseQuantity(${index})"
              >
                −
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

          `;

        }
      );


      document.getElementById(
        "cartTotal"
      ).textContent =
        "₦" +
        total.toLocaleString();

    }


    // ===============================
    // INCREASE
    // ===============================

    window.increaseQuantity =
      function (index) {

        const item =
          cart[index];

        const product =
          products[item.index];


        if (
          item.quantity >=
          Number(
            product.stock
          )
        ) {

          alert(
            "Not enough stock."
          );

          return;

        }


        item.quantity++;

        showCart();

      };


    // ===============================
    // DECREASE
    // ===============================

    window.decreaseQuantity =
      function (index) {

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


        showCart();

      };


    // ===============================
    // REMOVE
    // ===============================

    window.removeFromCart =
      function (index) {

        cart.splice(
          index,
          1
        );

        showCart();

      };


    // ===============================
    // COMPLETE SALE
    // ===============================

    completeSaleButton.addEventListener(
      "click",
      function () {

        if (
          cart.length === 0
        ) {

          alert(
            "Your cart is empty."
          );

          return;

        }


        const name =
          customerName.value.trim();

        const phone =
          customerPhone.value.trim();


        if (name === "") {

          alert(
            "Please enter customer name."
          );

          return;

        }


        if (phone === "") {

          alert(
            "Please enter customer phone number."
          );

          return;

        }


        let total = 0;


        cart.forEach(
          function (item) {

            total +=
              item.price *
              item.quantity;

          }
        );


        const paid =
          Number(
            amountPaid.value
          );


        if (
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


        // REDUCE STOCK

        cart.forEach(
          function (item) {

            products[
              item.index
            ].stock -=
              item.quantity;

          }
        );


        // SAVE SALE

        sales.unshift({

          date:
            new Date().toISOString(),

          customerName:
            name,

          customerPhone:
            phone,

          items:
            cart.map(
              function (item) {

                return {

                  name:
                    item.name,

                  price:
                    item.price,

                  quantity:
                    item.quantity,

                  type:
                    item.type

                };

              }
            ),

          total:
            total,

          paid:
            paid,

          change:
            change

        });


        saveData();


        // CHANGE

        document.getElementById(
          "changeDisplay"
        ).innerHTML = `

          <strong>
            Change:
            ₦${change.toLocaleString()}
          </strong>

        `;


        // RECEIPT ITEMS

        let receiptItems =
          "";


        cart.forEach(
          function (item) {

            const subtotal =
              item.price *
              item.quantity;


            receiptItems += `

              <div
                class="receipt-line"
              >

                <span>
                  ${item.name}
                  × ${item.quantity}
                </span>

                <span>
                  ₦${subtotal.toLocaleString()}
                </span>

              </div>

            `;

          }
        );


        // RECEIPT

        const receipt =
          document.getElementById(
            "receipt"
          );


        receipt.innerHTML = `

          <h2>
            ${storeSettings.storeName}
          </h2>

          ${
            storeSettings.ownerName
              ? `
                <p>
                  ${storeSettings.ownerName}
                </p>
              `
              : ""
          }

          ${
            storeSettings.address
              ? `
                <p>
                  ${storeSettings.address}
                </p>
              `
              : ""
          }

          ${
            storeSettings.phone
              ? `
                <p>
                  ${storeSettings.phone}
                </p>
              `
              : ""
          }

          <p>
            Sales Receipt
          </p>

          <hr>

          <p>
            <strong>
              Customer:
            </strong>
            ${name}
          </p>

          <p>
            <strong>
              Phone:
            </strong>
            ${phone}
          </p>

          <hr>

          ${receiptItems}


          <div class="receipt-total">

            <div class="receipt-line">

              <span>
                TOTAL
              </span>

              <span>
                ₦${total.toLocaleString()}
              </span>

            </div>


            <div class="receipt-line">

              <span>
                PAID
              </span>

              <span>
                ₦${paid.toLocaleString()}
              </span>

            </div>


            <div class="receipt-line">

              <span>
                CHANGE
              </span>

              <span>
                ₦${change.toLocaleString()}
              </span>

            </div>

          </div>


          <p>
            Thank you for shopping with us!
          </p>


          <button
            onclick="printReceipt()"
          >
            🖨️ Print Receipt
          </button>

        `;


        receipt.style.display =
          "block";


        // CLEAR

        cart = [];

        customerName.value = "";

        customerPhone.value = "";

        amountPaid.value = "";


        showCart();

        showProducts();

        showSaleProducts();

        showTodaySales();

        showSalesHistory();


        alert(
          "✅ Sale completed successfully!"
        );

      }
    );


    // ===============================
    // CUSTOMER HISTORY
    // ===============================

    customerSearch.addEventListener(
      "input",
      function () {

        showCustomerHistory();

      }
    );


    function showCustomerHistory() {

      const box =
        document.getElementById(
          "customerHistory"
        );


      const search =
        customerSearch.value
          .trim()
          .toLowerCase();


      if (
        search === ""
      ) {

        box.innerHTML =
          '<p class="muted">' +
          'Search for a customer to see their purchase history.' +
          '</p>';

        return;

      }


      const found =
        sales.filter(
          function (sale) {

            const name =
              String(
                sale.customerName ||
                ""
              ).toLowerCase();


            const phone =
              String(
                sale.customerPhone ||
                ""
              ).toLowerCase();


            return (
              name.includes(
                search
              ) ||
              phone.includes(
                search
              )
            );

          }
        );


      if (
        found.length === 0
      ) {

        box.innerHTML =
          '<p class="muted">' +
          'No customer history found.' +
          '</p>';

        return;

      }


      let totalSpent = 0;


      found.forEach(
        function (sale) {

          totalSpent +=
            Number(
              sale.total
            );

        }
      );


      let html = `

        <h3>
          👤 ${found[0].customerName}
        </h3>

        <p>
          Phone:
          ${found[0].customerPhone}
        </p>

        <p>

          <strong>
            Purchases:
          </strong>

          ${found.length}

          <br><br>

          <strong>
            Total Spent:
          </strong>

          ₦${totalSpent.toLocaleString()}

        </p>

        <hr>

      `;


      found.forEach(
        function (sale) {

          const date =
            new Date(
              sale.date
            );


          let items = "";


          sale.items.forEach(
            function (item) {

              items += `

                ${item.name}
                × ${item.quantity}
                —
                ₦${(
                  item.price *
                  item.quantity
                ).toLocaleString()}

                <br>

              `;

            }
          );


          html += `

            <div
              class="sale-record"
            >

              <strong>
                📅
                ${date.toLocaleDateString()}
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

            </div>

          `;

        }
      );


      box.innerHTML =
        html;

    }


    // ===============================
    // SALES HISTORY
    // ===============================

    function showSalesHistory() {

      const box =
        document.getElementById(
          "salesHistory"
        );


      box.innerHTML = "";


      if (
        sales.length === 0
      ) {

        box.innerHTML =
          '<p class="muted">' +
          'No sales yet.' +
          '</p>';

        return;

      }


      sales.forEach(
        function (sale) {

          const date =
            new Date(
              sale.date
            );


          let items = "";


          sale.items.forEach(
            function (item) {

              items +=
                item.name +
                " × " +
                item.quantity +
                "<br>";

            }
          );


          box.innerHTML += `

            <div
              class="sale-record"
            >

              <strong>
                Sale —
                ${date.toLocaleTimeString(
                  [],
                  {
                    hour:
                      "2-digit",

                    minute:
                      "2-digit"
                  }
                )}
              </strong>


              <div
                class="sale-items"
              >

                Customer:
                ${sale.customerName}

                <br>

                Phone:
                ${sale.customerPhone}

                <br><br>

                ${items}

              </div>


              <div
                class="sale-total"
              >

                Total:
                ₦${Number(
                  sale.total
                ).toLocaleString()}

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

            </div>

          `;

        }
      );

    }


    // ===============================
    // PRINT RECEIPT
    // ===============================

    window.printReceipt =
      function () {

        window.print();

      };


    // ===============================
    // INITIAL DISPLAY
    // ===============================

    loadStoreSettings();

    showProducts();

    showSaleProducts();

    showCart();

    showTodaySales();

    showSalesHistory();

  }
);
