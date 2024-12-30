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
          const newItemCards = document.querySelectorAll(".item-card");
          if (newItemCards.length === 0) {
            const bill = document.querySelector(".bill");
            bill.remove();
          } else {
            if (response.bill) {
              let bill = response.bill;
              const subtotal = document.getElementById("subtotal");
              const deliveryCharges =
                document.getElementById("delivery-charges");
              const total = document.getElementById("total");
              const discount = document.getElementById("discount");
              const freeDelivery = document.getElementById("free-delivery");
              const grandTotal = document.getElementById("grand-total");
              const youSave = document.getElementById("you-save");
              const youSavePercent =
                document.getElementById("you-save-percent");
              subtotal.innerText = bill.subtotal;
              deliveryCharges.innerText = bill.delivery_charges;
              total.innerText = bill.total;
              discount.innerText = bill.discount;
              freeDelivery.innerText = bill.free_delivery;
              grandTotal.innerText = bill.grand_total;
              youSave.innerText = bill.you_save;
              youSavePercent.innerText = `( ${bill.you_save_percent}% )`;
            }
          }
          itemCard.remove();
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
          quantity.value = parseInt(quantity.value) + 1;
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
          quantity.value = parseInt(quantity.value) - 1;
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
