// IMAGE SELECTION HANDLER

const imageTileList = document.getElementsByClassName("image-tile");
const displayImage = document.getElementById("display-image");
let src = "";
if (imageTileList.length > 0) {
  src = imageTileList[0].getAttribute("src");
}
displayImage.setAttribute("src", src);
for (let i = 0; i < imageTileList.length; i++) {
  imageTileList[i].addEventListener("click", (event) => {
    const src = imageTileList[i].getAttribute("src");
    displayImage.setAttribute("src", src);
    // displayImage.setAttribute("data-magnify-src", src);
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

if (cartButton) {
  cartButton.addEventListener("click", () => {
    let flag = 0;
    const selectedVariant = document.querySelector(".selected-variant");
    const qty = Number(document.getElementById("quantity").value.trim());
    if (isNaN(qty)) {
      flag = 1;
      alert("Enter a valid quantity.", "error");
    } else if (qty > 5 || qty < 1) {
      flag = 1;
      alert("Quantity should be in range 1 to 5.", "error");
    }
    if (flag === 0) {
      $.ajax({
        type: "POST",
        url: `/cart/${cartButton.dataset.productid}`,
        data: { qty, variantID: selectedVariant.dataset.id },
        success: function (response) {
          if (response.success) {
            if (response.message) {
              alert(response.message, "success");
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
    }
  });
}

const wishlistButton = document.querySelector(".add-to-wishlist-button");

if (wishlistButton) {
  wishlistButton.addEventListener("click", () => {
    const selectedVariant = document.querySelector(".selected-variant");
    $.ajax({
      type: "POST",
      url: `/wishlist/${wishlistButton.dataset.productid}`,
      data: { variantID: selectedVariant.dataset.id },
      success: function (response) {
        if (response.success) {
          if (response.message) {
            alert(response.message, "success");
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
}

//IMAGE ZOOM

const image = document.getElementById("display-image");
const zoomResult = document.getElementById("zoom-result");

image.addEventListener("mousemove", (event) => {
  const rect = image.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const xPercent = (x / rect.width) * 100;
  const yPercent = (y / rect.height) * 100;

  zoomResult.style.backgroundImage = `url(${image.src})`;
  zoomResult.style.backgroundSize = `${image.width * 2}px ${
    image.height * 2
  }px`;
  zoomResult.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
  zoomResult.style.display = "block";
});

image.addEventListener("mouseleave", () => {
  zoomResult.style.display = "none";
});
