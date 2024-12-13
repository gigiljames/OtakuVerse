// IMAGE SELECTION HANDLER

const imageTileList = document.getElementsByClassName("image-tile");
const displayImage = document.getElementById("display-image");
const src = imageTileList[0].getAttribute("src");
displayImage.setAttribute("src", src);
for (let i = 0; i < imageTileList.length; i++) {
  imageTileList[i].addEventListener("click", (event) => {
    const src = imageTileList[i].getAttribute("src");
    displayImage.setAttribute("src", src);
  });
}

function clearVariants() {
  variantCards.forEach((variantCard) => {
    variantCard.classList.remove("selected-variant");
  });
}

const variantCards = document.querySelectorAll(".variant-card");
variantCards.forEach((variantCard) => {
  variantCard.addEventListener("click", () => {
    if (!variantCard.classList.contains("disabled-variant")) {
      clearVariants();
      variantCard.classList.add("selected-variant");
    }
  });
});

const cartButton = document.querySelector(".add-to-cart-button");

cartButton.addEventListener("click", () => {
  let flag = 0;
  const selectedVariant = document.querySelector(".selected-variant");
  const qty = Number(document.getElementById("quantity").value.trim());
  if (isNaN(qty)) {
    flag = 1;
    alert("Enter a valid quantity.");
  } else if (qty > 5 || qty < 1) {
    flag = 1;
    alert("Quantity should be in range 1 to 5.");
  }
  if (flag === 0) {
    $.ajax({
      type: "POST",
      url: `/cart/${cartButton.dataset.productid}`,
      data: { qty, variantID: selectedVariant.dataset.id },
      success: function (response) {
        if (response.success) {
          if (response.message) {
            alert(response.message);
          }
        } else {
          if (response.message) {
            alert(response.message);
          }
        }
      },
      error: function (error) {},
    });
  }
});
