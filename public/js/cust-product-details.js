document.addEventListener("DOMContentLoaded", () => {
  const burgerIcon1 = document.getElementById("burger-menu");
  if (burgerIcon1) {
    burgerIcon1.click();
  }

  // IMAGE SELECTION HANDLER

  const imageTileList = document.getElementsByClassName("image-tile");
  const displayImage = document.getElementById("display-image");
  if (displayImage && imageTileList.length > 0) {
    const initialSrc = imageTileList[0].getAttribute("src");
    if (initialSrc && !displayImage.getAttribute("src")) {
      displayImage.setAttribute("src", initialSrc);
    }
  }

  for (let i = 0; i < imageTileList.length; i++) {
    imageTileList[i].addEventListener("click", (event) => {
      const src = imageTileList[i].getAttribute("src");
      if (displayImage && src) {
        displayImage.setAttribute("src", src);
      }
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
      const qtyInput = document.getElementById("quantity");
      const qty = qtyInput ? Number(qtyInput.value.trim()) : 1;
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
          data: { qty, variantID: selectedVariant ? selectedVariant.dataset.id : "" },
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
        data: { variantID: selectedVariant ? selectedVariant.dataset.id : "" },
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

  // IMAGE ZOOM

  const image = document.getElementById("display-image");
  const zoomResult = document.getElementById("zoom-result");

  if (image && zoomResult) {
    image.addEventListener("mousemove", (event) => {
      const rect = image.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const xPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const yPercent = Math.max(0, Math.min(100, (y / rect.height) * 100));

      zoomResult.style.backgroundImage = `url("${image.src}")`;
      zoomResult.style.backgroundSize = `${rect.width * 2.5}px ${rect.height * 2.5}px`;
      zoomResult.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
      zoomResult.style.display = "block";
    });

    image.addEventListener("mouseleave", () => {
      zoomResult.style.display = "none";
    });
  }
});
