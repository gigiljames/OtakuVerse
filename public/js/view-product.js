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

// JavaScript for image preview and remove functionality
const fileInput = document.getElementById("product-images");
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
