const addCategoryForm = document.getElementsByClassName("add-form-outer")[0];

//ADD FORM BUTTONS

const closeButton = document.getElementsByClassName("close-button")[0];
const addButton = document.getElementsByClassName("add-button")[0];

closeButton.addEventListener("click", (event) => {
  addCategoryForm.style.display = "none";
});
addButton.addEventListener("click", (event) => {
  addCategoryForm.style.display = "flex";
});

//ADD FORM VALIDATION

const nameError = document.getElementById("name-error");
const descError = document.getElementById("desc-error");

const errorContainers = document.getElementsByClassName("error-container");
function clearErrors() {
  for (let i = 0; i < errorContainers.length; i++) {
    errorContainers[i].innerText = "";
  }
}

addCategoryForm.addEventListener("submit", (event) => {
  clearErrors();
  flag = 0;
  const name = document.getElementById("cat-name").value.trim();
  const desc = document.getElementById("cat-desc").value.trim();
  if (!name) {
    flag = 1;
    nameError.innerText = "*This field is required.";
  }
  if (!desc) {
    flag = 1;
    descError.innerText = "*This field is required.";
  }
  if (flag === 1) {
    event.preventDefault();
  }
});
