const editForm = document.getElementById("edit-cat-form");
const nameError = document.getElementById("cat-name-error");
const offerError = document.getElementById("cat-offer-error");
const descError = document.getElementById("cat-desc-error");
const errorContainers = document.getElementsByClassName("error-container");

//EDIT FORM VALIDATION
editForm.addEventListener("submit", (event) => {
  clearErrors();
  event.preventDefault();
  const catName = document.getElementById("cat-name").value.trim();
  const catDesc = document.getElementById("cat-desc").value.trim();
  const catOffer = document.getElementById("cat-offer").value.trim();
  const catID = editForm.dataset.id;
  let flag = 0;
  if (!catName) {
    flag = 1;
    nameError.innerText = "*This is a required field.";
  }
  if (!catDesc) {
    flag = 1;
    descError.innerText = "*This is a required field.";
  }
  if (!catOffer) {
    flag = 1;
    offerError.innerText = "Enter category offer.";
  } else if (isNaN(catOffer)) {
    flag = 1;
    offerError.innerText = "Category offer should be a valid number.";
  } else if (Number(catOffer) < 0 || Number(catOffer) > 100) {
    flag = 1;
    offerError.innerText = "Category offer should be in the range (0-100).";
  }
  if (flag === 0) {
    $.ajax({
      url: `/admin/edit-category/${catID}`,
      type: "PATCH",
      data: { name: catName, desc: catDesc, offer: catOffer },
      success: function (response) {
        if (response.success) {
          alert(response.message, "success", () => {
            window.location.reload();
          });
        } else {
          if (response.message) {
            alert(response.message, "error");
          }
          if (response.redirectUrl) {
            window.location.href = response.redirectUrl;
          }
        }
      },
      error: function (xhr, status, error) {
        alert("An error occurred while while editing category.", "error");
      },
    });
  }
});

function clearErrors() {
  for (let i = 0; i < errorContainers.length; i++) {
    errorContainers[i].innerText = "";
  }
}

//ENABLE CONFIRM BUTTON
const confirmButton = document.getElementById("confirm-button");
const catNameInput = document.getElementById("cat-name");
const existingCatName = document.getElementById("cat-name").value.trim();
const catOfferInput = document.getElementById("cat-offer");
const existingCatOffer = document.getElementById("cat-offer").value.trim();
const catDescInput = document.getElementById("cat-desc");
const existingCatDesc = document.getElementById("cat-desc").value.trim();
catNameInput.addEventListener("input", checkChanges);
catDescInput.addEventListener("input", checkChanges);
catOfferInput.addEventListener("input", checkChanges);

function checkChanges(event) {
  if (
    catOfferInput.value.trim() === existingCatOffer &&
    catNameInput.value.trim() === existingCatName &&
    catDescInput.value.trim() === existingCatDesc
  ) {
    confirmButton.disabled = true;
  } else {
    confirmButton.disabled = false;
  }
}

//DELETE CATEGORY
const deleteCatButton = document.querySelector("#delete-button");

deleteCatButton.addEventListener("click", async (event) => {
  event.preventDefault();
  const catID = deleteCatButton.dataset.id;
  if (
    await yes({
      message: "Are you sure you want to delete this category?",
      yesButtonColour: "red",
    })
  ) {
    let keepProducts;
    if (
      await yes({
        message: "Do you want to keep the products?",
        yesButtonColour: "red",
        yesButtonText: "Yes, keep products",
        noButtonText: "No",
      })
    ) {
      keepProducts = true;
    } else {
      keepProducts = false;
    }
    $.ajax({
      url: `/admin/delete-category/${catID}?keepProducts=${keepProducts}`,
      type: "DELETE",
      success: function (response) {
        if (response.success) {
          alert(response.message, "success", () => {
            window.location.href = response.redirectUrl;
          });
        } else {
          if (response.message) {
            alert(response.message, "error");
          }
          if (response.redirectUrl) {
            window.location.href = response.redirectUrl;
          }
        }
      },
      error: function (xhr, status, error) {
        alert("An error occurred while while deleting the category.", "error");
      },
    });
  }
});
