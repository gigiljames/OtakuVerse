const editForm = document.getElementById("edit-cat-form");
const nameError = document.getElementById("cat-name-error");
const descError = document.getElementById("cat-desc-error");
const errorContainers = document.getElementsByClassName("error-container");

//EDIT FORM VALIDATION
editForm.addEventListener("submit", (event) => {
  clearErrors();
  event.preventDefault();
  const catName = document.getElementById("cat-name").value.trim();
  const catDesc = document.getElementById("cat-desc").value.trim();
  const files = document.getElementById("banner-images").files;
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
  if (flag === 0) {
    const formData = new FormData();
    formData.append("name", catName);
    formData.append("desc", catDesc);
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    $.ajax({
      url: `/admin/edit-category/${catID}`,
      type: "PATCH",
      data: formData,
      contentType: false,
      processData: false,
      success: function (response) {
        if (response.success) {
          alert(response.message, "success", () => {
            window.location.reload();
          });
        } else {
          if (response.message) {
            alert(response.message, "error");
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
const catDescInput = document.getElementById("cat-desc");
const existingCatDesc = document.getElementById("cat-desc").value.trim();
const bannerImgInput = document.getElementById("banner-images");
catNameInput.addEventListener("input", checkChanges);
catDescInput.addEventListener("input", checkChanges);
bannerImgInput.addEventListener("input", (event) => {
  confirmButton.disabled = false;
});

function checkChanges(event) {
  if (
    catNameInput.value.trim() === existingCatName &&
    catDescInput.value.trim() === existingCatDesc
  ) {
    confirmButton.disabled = true;
  } else {
    confirmButton.disabled = false;
  }
}

// JavaScript for image preview and remove functionality
const fileInput = document.getElementById("banner-images");
const previewContainer = document.getElementById("image-preview");

// Event listener to handle image file selection
fileInput.addEventListener("change", function (event) {
  const files = event.target.files;
  previewContainer.innerHTML = ""; // Clear previous previews

  // Loop through the selected files and create previews
  Array.from(files).forEach((file, index) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const imageCard = document.createElement("div");
      imageCard.classList.add("image-card");

      const image = document.createElement("img");
      image.src = e.target.result;
      image.alt = file.name;

      // Create a remove button for the image preview
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.classList.add("remove-button");
      const closeIcon = document.createElement("span");
      closeIcon.innerText = "close";
      closeIcon.classList.add("material-symbols-outlined");
      removeButton.appendChild(closeIcon);

      // Add event listener to remove the image when the button is clicked
      removeButton.addEventListener("click", function () {
        imageCard.remove(); // Remove the image preview
        // Also remove the file from the input by resetting the input value
        const dataTransfer = new DataTransfer(); // Create a new DataTransfer object
        Array.from(fileInput.files).forEach((item, i) => {
          if (i !== index) {
            dataTransfer.items.add(item); // Add all other files
          }
        });
        fileInput.files = dataTransfer.files; // Update the file input
      });

      // Append the image and the remove button to the image card
      imageCard.appendChild(image);
      imageCard.appendChild(removeButton);
      previewContainer.appendChild(imageCard);
    };

    reader.readAsDataURL(file); // Read the file as a data URL
  });
});

//DELETE BANNER IMAGES
const deleteBannerButtons = document.querySelectorAll(".delete-banner-button");
deleteBannerButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    const catId = button.dataset.catid;
    const imgId = button.dataset.banid;
    $.ajax({
      url: `/admin/delete-catbanner/${catId}/${imgId}`,
      type: "DELETE",
      data: { catId, imgId },
      success: function (response) {
        if (response.success) {
          alert(response.message, "success", () => {
            window.location.reload();
          });
        } else {
          if (response.message) {
            alert(response.message, "error");
          }
        }
      },
      error: function (xhr, status, error) {
        alert("An error occurred while while deleting banner image.", "error");
      },
    });
  });
});

//DELETE CATEGORY
const deleteCatButton = document.querySelector("#delete-button");

deleteCatButton.addEventListener("click", (event) => {
  event.preventDefault();
  const catID = deleteCatButton.dataset.id;
  $.ajax({
    url: `/admin/delete-category/${catID}/`,
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
      }
    },
    error: function (xhr, status, error) {
      alert("An error occurred while while deleting the category.", "error");
    },
  });
});
