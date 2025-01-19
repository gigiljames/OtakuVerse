const addFormOuter = document.getElementsByClassName("add-form-outer")[0];

//ADD FORM BUTTONS

const closeButton = document.getElementsByClassName("close-button")[0];
const addButton = document.getElementsByClassName("add-button")[0];

closeButton.addEventListener("click", (event) => {
  addFormOuter.style.display = "none";
});
addButton.addEventListener("click", (event) => {
  addFormOuter.style.display = "flex";
});

//ADD FORM VALIDATION

const addForm = document.getElementById("add-form");
const errorContainers = document.getElementsByClassName("error-container");
const nameError = document.getElementById("name-error");
const descError = document.getElementById("desc-error");
const categoryError = document.getElementById("category-error");
const priceError = document.getElementById("price-error");
const discountError = document.getElementById("discount-error");
const specsError = document.getElementById("specs-error");

addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearErrors();
  const name = document.getElementById("name-input").value.trim();
  const desc = document.getElementById("desc-input").value.trim();
  const specs = document.getElementById("specs-input").value.trim();
  const category = document.getElementById("category-input").value.trim();
  const price = parseFloat(document.getElementById("price-input").value.trim());
  const visibility = document.getElementById("visibility-input").value;
  const discount = parseFloat(
    document.getElementById("discount-input").value.trim()
  );
  let flag = 0;
  if (!name) {
    flag = 1;
    nameError.innerText = "Enter product name.";
  }
  if (!desc) {
    flag = 1;
    descError.innerText = "Enter product description.";
  }
  if (!category) {
    flag = 1;
    categoryError.innerText = "Select category.";
  }
  if (isNaN(price) || price < 0) {
    priceError.innerText = "Price must be a non-negative number.";
    flag = 1;
  }
  if (isNaN(discount) || discount < 0 || discount > 100) {
    discountError.innerText = "Discount must be a number between 0 and 100.";
    flag = 1;
  }
  if (!specs) {
    flag = 1;
    specsError.innerText = "Enter product specifications.";
  }
  if (flag === 0) {
    $.ajax({
      url: "/admin/add-product",
      type: "POST",
      data: { name, category, price, discount, visibility, desc, specs },
      success: function (response) {
        if (response.success) {
          alert(
            response.message,
            "success",
            () => {
              window.location.reload();
            },
            3000
          );
        }
      },
      error: function (response) {},
    });
  }
  // event.preventDefault();
});

function clearErrors() {
  for (let i = 0; i < errorContainers.length; i++) {
    errorContainers[i].innerText = "";
  }
}

function handleVisibility(productID) {
  const button = document.querySelector(`#button-${productID}`);
  const visible = button.dataset.visible;
  if (visible === "true") {
    $.ajax({
      url: `/admin/disable-product/${productID}`,
      type: "PATCH",
      success: function (response) {
        if (response.success) {
          alert(response.message, "success");
          button.innerText = "Enable";
          button.dataset.visible = "false";
          const visibilityData = document.querySelector(
            `#visibility-${productID}`
          );
          visibilityData.innerText = "Blocked";
        }
      },
    });
  } else if (visible === "false") {
    $.ajax({
      url: `/admin/enable-product/${productID}`,
      type: "PATCH",
      success: function (response) {
        if (response.success) {
          alert(response.message, "success");
          button.innerText = "Disable";
          button.dataset.visible = "true";
          const visibilityData = document.querySelector(
            `#visibility-${productID}`
          );
          visibilityData.innerText = "Visible";
        }
      },
    });
  }
}

// function disableProduct(productID) {
//   $.ajax({
//     url: `/admin/disable-product/${productID}`,
//     type: "PATCH",
//     success: function (response) {
//       if (response.success) {
//         alert(response.message, "success");
//         const button = document.querySelector(`#block-${productID}`);
//         const td = button.closest("td");
//         td.innerHTML = `<button class="unblock-button" id="unblock-${productID}" onclick="enableProduct(${productID})">Enable</button>`;
//       }
//     },
//   });
// }

// function enableProduct(productID) {
//   $.ajax({
//     url: `/admin/enable-product/${productID}`,
//     type: "PATCH",
//     success: function (response) {
//       if (response.success) {
//         alert(response.message, "success");
//         const button = document.querySelector(`#unblock-${productID}`);
//         const td = button.closest("td");
//         td.innerHTML = `<button class="block-button" id="block-${productID}" onclick="disableProduct(${productID})">Disable</button>`;
//       }
//     },
//   });
// }
