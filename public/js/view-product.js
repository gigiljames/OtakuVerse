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
const sizeInput = document.getElementById("size-input");
const colourInput = document.getElementById("colour-input");
const stockInput = document.getElementById("stock-input");
const sizeError = document.getElementById("size-error");
const colourError = document.getElementById("colour-error");
const stockError = document.getElementById("stock-error");

const showError = (element, message) => {
  element.textContent = message;
};

// Form submission event listener
addForm.addEventListener("submit", (event) => {
  clearErrors();
  let isValid = true;
  if (!sizeInput.value.trim()) {
    showError(sizeError, "*This field is required");
    isValid = false;
  }
  if (!colourInput.value.trim()) {
    showError(colourError, "*This field is required");
    isValid = false;
  }
  const stockValue = stockInput.value.trim();
  if (!stockValue) {
    showError(stockError, "*This field is required");
    isValid = false;
  } else if (isNaN(stockValue)) {
    showError(stockError, "Invalid input");
    isValid = false;
  }

  if (!isValid) {
    event.preventDefault();
  }
});

//EDIT FORM VALIDATION

const editForm = document.getElementById("edit-form");
const nameError = document.getElementById("name-error");
const priceError = document.getElementById("price-error");
const descError = document.getElementById("desc-error");
const discountError = document.getElementById("discount-error");
const specsError = document.getElementById("specs-error");
const errorContainers = document.getElementsByClassName("error-container");

editForm.addEventListener("submit", (event) => {
  clearErrors();
  let flag = 0;
  const name = document.getElementById("name-input").value.trim();
  const price = document.getElementById("price-input").value.trim();
  const desc = document.getElementById("desc-input").value.trim();
  const discount = document.getElementById("discount-input").value.trim();
  const specs = document.getElementById("specs-input").value.trim();
  if (!name) {
    flag = 1;
    nameError.innerText = "*This field is required";
  }
  if (isNaN(Number(price))) {
    flag = 1;
    priceError.innerText = "Invalid value";
  }
  if (!price) {
    flag = 1;
    priceError.innerText = "*This field is required";
  }
  if (!desc) {
    flag = 1;
    descError.innerText = "*This field is required";
  }
  if (isNaN(Number(discount))) {
    flag = 1;
    discountError.innerText = "Invalid value";
  }
  if (!discount) {
    flag = 1;
    discountError.innerText = "*This field is required";
  }
  if (!specs) {
    flag = 1;
    specsError.innerText = "*This field is required";
  }
  if (flag === 1) {
    event.preventDefault();
  }
});

function clearErrors() {
  for (let i = 0; i < errorContainers.length; i++) {
    errorContainers[i].innerText = "";
  }
}

const fileInput = document.getElementById("product-images");
const previewContainer = document.getElementById("image-preview");
const cropModal = document.getElementById("crop-modal");
const cropImage = document.getElementById("crop-image");
const saveCropButton = document.getElementById("save-crop");
const cancelCropButton = document.getElementById("cancel-crop");
const uploadButton = document.getElementById("upload-images");

let cropper; // To hold the Cropper.js instance
let croppedFile = null; // Store the cropped file

// Event listener to handle image file selection
fileInput.addEventListener("change", function (event) {
  const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
  const file = event.target.files[0]; // Get the single selected file
  if (file) {
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      alert(
        "Invalid file type. Please upload a .jpg, .jpeg, or .png file.",
        "error"
      );
      fileInput.value = ""; // Clear the input field
      return;
    }

    // Proceed with cropping logic
    previewContainer.innerHTML = ""; // Clear previous previews
    croppedFile = null;
    startCropping(file);
  }
});

// Start cropping the given file
function startCropping(file) {
  if (!file.type.startsWith("image/")) {
    alert("Please upload only image files.", "error");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    cropModal.style.display = "block"; // Show the cropping modal
    cropImage.src = e.target.result; // Load the image into the modal

    // Initialize Cropper.js with square cropping
    cropper = new Cropper(cropImage, {
      aspectRatio: 1, // Enforce square aspect ratio
      viewMode: 2,
    });
  };

  reader.readAsDataURL(file); // Read the file as a data URL
}

// Save the cropped image
saveCropButton.addEventListener("click", function () {
  if (cropper) {
    cropper.getCroppedCanvas().toBlob((blob) => {
      // Create a new file from the cropped blob
      croppedFile = new File([blob], fileInput.files[0].name, {
        type: fileInput.files[0].type,
      });

      // Create a preview card for the cropped image
      const imageCard = document.createElement("div");
      imageCard.classList.add("image-card");

      const image = document.createElement("img");
      image.src = URL.createObjectURL(croppedFile);

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.classList.add("remove-button");
      const closeIcon = document.createElement("span");
      closeIcon.innerText = "close";
      closeIcon.classList.add("material-symbols-outlined");
      removeButton.appendChild(closeIcon);

      removeButton.addEventListener("click", function () {
        imageCard.remove();
        croppedFile = null; // Clear the cropped file
        fileInput.value = ""; // Clear the file input
      });

      imageCard.appendChild(image);
      imageCard.appendChild(removeButton);
      previewContainer.appendChild(imageCard);

      // Destroy the Cropper instance
      cropper.destroy();
      cropModal.style.display = "none"; // Hide the modal
      alert("Image cropped and added successfully!", "success");
    });
  }
});

// Cancel cropping
cancelCropButton.addEventListener("click", function () {
  if (cropper) {
    cropper.destroy();
    cropModal.style.display = "none"; // Hide the modal
    alert("Cropping canceled!", "info");
  }
  fileInput.value = ""; // Clear the file input
});

uploadButton.addEventListener("click", function () {
  const id = uploadButton.dataset.id;
  if (!croppedFile) {
    alert("Please crop an image before uploading.", "error");
    return;
  }

  const formData = new FormData();
  formData.append("image", croppedFile); // Append the single cropped file

  // Send the cropped image to the backend via AJAX
  $.ajax({
    url: `/admin/add-product-image/${id}`,
    type: "POST",
    processData: false,
    contentType: false,
    data: formData,
    success: function (response) {
      if (response.success) {
        alert(response.message, "success", () => {
          window.location.reload();
        });
      } else {
        alert(response.message, "error");
      }
    },
  });
});

const variantCards = document.querySelectorAll(".variant-cards");

variantCards.forEach((variantCard) => {
  const stockUpdateError = variantCard.querySelector(".stock-update-error");

  const editButton = variantCard.querySelector(".edit-stock-button");
  const saveButton = variantCard.querySelector(".save-stock-button");
  editButton.addEventListener("click", () => {
    const stockInput = variantCard.querySelector(".stock-update-input");
    const stockData = variantCard.querySelector(".stock-data");
    stockInput.style.display = "block";
    stockData.style.display = "none";
    editButton.style.display = "none";
    saveButton.style.display = "block";
  });
  saveButton.addEventListener("click", () => {
    stockUpdateError.innerText = "";
    const stockInput = variantCard.querySelector(".stock-update-input");
    const stockData = variantCard.querySelector(".stock-data");

    const stock = Number(stockInput.value.trim());
    if (stock === "undefined" || stock < 0) {
      stockUpdateError.innerText = "Enter a valid stock value.";
    } else {
      const variantID = saveButton.dataset.id;
      $.ajax({
        type: "PATCH",
        url: `/admin/edit-stock/${variantID}`,
        data: { stock },
        success: function (response) {
          if (response.success) {
            if (response.message) {
              alert(response.message, "success");
            }
            stockInput.style.display = "none";
            stockData.style.display = "block";
            editButton.style.display = "block";
            saveButton.style.display = "none";
            stockData.innerText = stock;
          } else {
            if (response.message) {
              alert(response.message, "error");
            }
          }
        },
        error: function (error) {},
      });
    }
  });
});
