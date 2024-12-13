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
            alert(response.message);
          }
          if (response.bill) {
            let bill = response.bill;
            const subtotal = document.getElementById("subtotal");
            const deliveryCharges = document.getElementById("delivery-charges");
            const total = document.getElementById("total");
            const discount = document.getElementById("discount");
            const freeDelivery = document.getElementById("free-delivery");
            const grandTotal = document.getElementById("grand-total");
            const youSave = document.getElementById("you-save");
            const youSavePercent = document.getElementById("you-save-percent");
            subtotal.innerText = bill.subtotal;
            deliveryCharges.innerText = bill.delivery_charges;
            total.innerText = bill.total;
            discount.innerText = bill.discount;
            freeDelivery.innerText = bill.free_delivery;
            grandTotal.innerText = bill.grand_total;
            youSave.innerText = bill.you_save;
            youSavePercent.innerText = `( ${bill.you_save_percent}% )`;
          }
          itemCard.remove();
        } else {
          if (response.message) {
            alert(response.message);
          }
        }
      },
      error: function (error) {},
    });
  });
});
