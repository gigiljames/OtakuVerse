const addForm = document.getElementsByClassName("add-form-outer")[0];

//ADD FORM BUTTONS

const closeButton = document.getElementsByClassName("close-button")[0];
const addButton = document.getElementsByClassName("add-button")[0];

closeButton.addEventListener("click", (event) => {
  addForm.style.display = "none";
});
addButton.addEventListener("click", (event) => {
  addForm.style.display = "flex";
});

//ADD FORM VALIDATION

const nameError = document.getElementById("name-error");
const descError = document.getElementById("desc-error");
const errorContainers = document.getElementsByClassName("error-container");

addForm.addEventListener("submit", (event) => {
  clearErrors();
  flag = 0;
  const inputContainers = document.querySelectorAll(".input-container");
  inputContainers.forEach((container, index) => {
    const input = container.querySelector("input").value.trim();
    const errorContainer = container.querySelector(".error-container");
    if (!input) {
      flag = 1;
      errorContainer.innerText = "*This field is required";
    }
  });
  if (flag === 1) {
    event.preventDefault();
  }
});

function clearErrors() {
  for (let i = 0; i < errorContainers.length; i++) {
    errorContainers[i].innerText = "";
  }
}
