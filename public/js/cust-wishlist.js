const itemCards = document.querySelectorAll(".item-card");

itemCards.forEach((itemCard) => {
  const cartButton = itemCard.querySelector(".add-to-cart-button");
  if (cartButton) {
    cartButton.addEventListener("click", () => {
      $.ajax({
        type: "POST",
        url: `/cart/${cartButton.dataset.productid}`,
        data: { qty: 1, variantID: cartButton.dataset.variantid },
        success: function (response) {
          if (response.success) {
            if (response.message) {
              alert(response.message, "success");
            }
            const removeButton = itemCard.querySelector(".remove-button");
            const itemID = removeButton.dataset.id;
            $.ajax({
              type: "DELETE",
              url: `/wishlist/${itemID}`,
              success: function (response) {
                if (response.success) {
                  itemCard.remove();
                } else {
                  if (response.message) {
                    alert(response.message, "error");
                  }
                }
              },
              error: function (error) {},
            });
          } else {
            if (response.message) {
              alert(response.message, "error");
            }
          }
        },
        error: function (error) {},
      });
    });
  }
  const removeButton = itemCard.querySelector(".remove-button");
  removeButton.addEventListener("click", () => {
    const itemID = removeButton.dataset.id;
    $.ajax({
      type: "DELETE",
      url: `/wishlist/${itemID}`,
      success: function (response) {
        if (response.success) {
          if (response.message) {
            alert(response.message, "success");
          }
          itemCard.remove();
        } else {
          if (response.message) {
            alert(response.message, "error");
          }
        }
      },
      error: function (error) {},
    });
  });
});
