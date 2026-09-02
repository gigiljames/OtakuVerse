document.addEventListener("DOMContentLoaded", () => {
  refreshBill();
});

const itemCards = document.querySelectorAll(".item-card");

itemCards.forEach((itemCard) => {
  const removeButton = itemCard.querySelector(".remove-button");
  removeButton.addEventListener("click", () => {
    const itemID = removeButton.dataset.id;
    $.ajax({
      type: "DELETE",
      url: `/cart/${itemID}`,
      success: function (response) {
        if (response.success) {
          if (response.message) {
            alert(response.message, "success");
          }
          itemCard.remove();
          const newItemCards = document.querySelectorAll(".item-card");
          if (newItemCards.length === 0) {
            const bill = document.querySelector(".bill-section");
            bill.remove();
          } else {
            refreshBill();
            // if (response.bill) {
            //   let bill = response.bill;
            //   const subtotal = document.getElementById("subtotal");
            //   const deliveryCharges =
            //     document.getElementById("delivery-charges");
            //   const total = document.getElementById("total");
            //   const discount = document.getElementById("discount");
            //   const freeDelivery = document.getElementById("free-delivery");
            //   const grandTotal = document.getElementById("grand-total");
            //   const youSave = document.getElementById("you-save");
            //   const youSavePercent =
            //     document.getElementById("you-save-percent");
            //   subtotal.innerText = bill.subtotal;
            //   deliveryCharges.innerText = bill.delivery_charges;
            //   total.innerText = bill.total;
            //   discount.innerText = bill.discount;
            //   freeDelivery.innerText = bill.free_delivery;
            //   grandTotal.innerText = bill.grand_total;
            //   youSave.innerText = bill.you_save;
            //   youSavePercent.innerText = `( ${bill.you_save_percent}% )`;
            // }
          }
        } else {
          if (response.message) {
            alert(response.message, "error");
          }
          if (response.redirectUrl) {
            window.location.href = response.redirectUrl;
          }
        }
      },
      error: function (error) {},
    });
  });
  const incButton = itemCard.querySelector(".inc-button");
  console.log(incButton);
  incButton.addEventListener("click", () => {
    console.log("Hello");
    $.ajax({
      url: `/cart/${incButton.dataset.productid}`,
      type: "POST",
      data: { qty: 1, variantID: incButton.dataset.variantid },
      success: function (response) {
        if (response.success) {
          const quantity = itemCard.querySelector(".quantity");
          const price = itemCard.querySelector(".product-total-price");
          let oldQuantity = parseInt(quantity.value);
          let singlePrice = parseFloat(price.innerText) / oldQuantity;
          quantity.value = oldQuantity + 1;
          price.innerText = (quantity.value * singlePrice).toFixed(2);
          refreshBill();
        } else {
          if (response.message) {
            alert(response.message, "error");
          }
          if (response.redirectUrl) {
            window.location.href = response.redirectUrl;
          }
        }
      },
    });
  });
  const decButton = itemCard.querySelector(".dec-button");
  decButton.addEventListener("click", () => {
    $.ajax({
      url: `/cart/one/${incButton.dataset.productid}`,
      type: "DELETE",
      data: { variantID: incButton.dataset.variantid },
      success: function (response) {
        if (response.success) {
          const quantity = itemCard.querySelector(".quantity");
          const price = itemCard.querySelector(".product-total-price");
          let oldQuantity = parseInt(quantity.value);
          let singlePrice = parseFloat(price.innerText) / oldQuantity;
          quantity.value = oldQuantity - 1;
          price.innerText = (quantity.value * singlePrice).toFixed(2);
          refreshBill();
        } else {
          if (response.message) {
            alert(response.message, "error");
          }
          if (response.redirectUrl) {
            window.location.href = response.redirectUrl;
          }
        }
      },
    });
  });
});

const checkoutButton = document.querySelector(".checkout-button");
checkoutButton.addEventListener("click", (event) => {
  const outOfStock = document.querySelector(".out-of-stock");
  if (outOfStock) {
    event.preventDefault();
    alert(
      "Please remove out of stock items before proceeding to checkout.",
      "error"
    );
  }
});

async function refreshBill() {
  await $.ajax({
    type: "GET",
    url: "/cart/refresh-bill",
    success: function (response) {
      if (response.success) {
        updateBill(response.bill);
      }
    },
  });
}

function updateBill(bill) {
  const billSection = document.querySelector(".bill-section");
  const newItemCards = document.querySelectorAll(".item-card");
  if (newItemCards.length !== 0) {
    billSection.innerHTML = "";
    const billDiv = document.createElement("div");
    billDiv.classList.add("bill");
    billDiv.innerHTML = `<div class="bill-title">Bill</div>
              <ul><li>
                  <span>Subtotal</span>
                  <span id="subtotal">${bill.subtotal}</span>
                </li>
                <li>
                  <span>Delivery Charges</span>
                  <span id="delivery-charges">${bill.delivery_charges}</span>
                </li>
                <li>
                  <span>Total</span>
                  <span id="total">${bill.total}</span>
                </li>
                <li><span>Discount</span>
                  <span id="discount">${bill.discount}</span>
                </li>
                <li><span>Free Delivery</span>
                  <span id="free-delivery">${bill.free_delivery}</span>
                </li>
                <li><span>Grand Total</span>
                  <span id="grand-total">${bill.grand_total}</span>
                </li>
                <li><span>You save</span> <span id="you-save">${bill.you_save}</span><span id="you-save-percent"> (${bill.you_save_percent}%)</span>
                  <span></span>
                </li></ul>
              <a href="/checkout"><button class="checkout-button">Proceed to checkout</button></a>`;
    billSection.appendChild(billDiv);
  } else {
    billSection.remove();
  }
}
