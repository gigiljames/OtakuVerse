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
  clearErrors();
  const name = document.getElementById("name-input").value.trim();
  const desc = document.getElementById("desc-input").value.trim();
  const specs = document.getElementById("specs-input").value.trim();
  const category = document.getElementById("category-input").value.trim();
  const price = document.getElementById("price-input").value.trim();
  const discount = document.getElementById("discount-input").value.trim();
  let flag = 0;
  if (!name) {
    flag = 1;
    nameError.innerText = "*This field is required.";
  }
  if (!desc) {
    flag = 1;
    descError.innerText = "*This field is required.";
  }
  if (!category) {
    flag = 1;
    categoryError.innerText = "*This field is required.";
  }
  if (!price) {
    flag = 1;
    priceError.innerText = "*This field is required.";
  }
  if (!discount) {
    flag = 1;
    discountError.innerText = "*This field is required.";
  }
  if (!specs) {
    flag = 1;
    specsError.innerText = "*This field is required.";
  }
  if (flag === 1) {
    event.preventDefault();
  }
  // event.preventDefault();
});

function clearErrors() {
  for (let i = 0; i < errorContainers.length; i++) {
    errorContainers[i].innerText = "";
  }
}
