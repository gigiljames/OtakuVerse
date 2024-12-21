const orderCards = document.querySelectorAll(".order-card");

//DOM is Being Re-rendered: If you dynamically update the DOM without removing previously attached listeners, the event listener will be duplicated.

orderCards.forEach((orderCard) => {
  const button = orderCard.querySelector(".cancel-button");
  if (!button) {
    return;
  }
  button.addEventListener("click", () => {
    const orderID = button.dataset.id;
    const status = orderCard.querySelector(".status");
    const orderFunctions = orderCard.querySelector(".order-functions");
    const deliveryDate = orderCard.querySelector(".delivery-date");
    $.ajax({
      type: "DELETE",
      url: `/cancel-order/${orderID}`,
      success: function (response) {
        if (response.success) {
          if (response.message) {
            alert(response.message, "success");
          }
          status.innerText = "Cancelled";
          status.style.color = "red";
          deliveryDate.remove();
          orderFunctions.remove();
        } else {
          if (response.message) {
            alert(response.message, "error");
          }
        }
      },
    });
  });
  const cancelOneItemButtons = document.querySelectorAll(".cancel-one-item");
  cancelOneItemButtons.forEach((button) => {
    if (!button.dataset.listenerAdded) {
      button.dataset.listenerAdded = true;
      button.addEventListener("click", (event) => {
        const orderID = button.dataset.orderid;
        const variantID = button.dataset.variantid;
        const qty = button.dataset.qty;
        const orderCard = button.closest(".order-card");
        // console.log(variantID);
        $.ajax({
          url: `/cancel-item/${orderID}/${variantID}`,
          type: "DELETE",
          data: { qty },
          success: function (response) {
            if (response.success) {
              alert(response.message, "success", () => {
                const itemCard = orderCard.querySelector(`.item-${variantID}`);
                itemCard.remove();
                const itemCards = orderCard.querySelectorAll(".item-card");
                if (itemCards.length === 1) {
                  const cancelButton =
                    itemCards[0].querySelector(".cancel-one-item");
                  cancelButton.remove();
                }
              });
            } else {
              alert(response.message, "error");
            }
          },
          error: function (error) {},
        });
      });
    }
  });
});
