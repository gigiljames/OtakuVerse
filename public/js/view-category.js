const editForm = document.getElementById("edit-cat-form");
const nameError = document.getElementById("cat-name-error");
const descError = document.getElementById("cat-desc-error");
const errorContainers = document.getElementsByClassName("error-container");

//EDIT FORM VALIDATION
editForm.addEventListener("submit", (event) => {
  clearErrors();
  const catName = document.getElementById("cat-name").value.trim();
  const catDesc = document.getElementById("cat-desc").value.trim();
  let flag = 0;
  if (!catName) {
    flag = 1;
    nameError.innerText = "*This is a required field.";
  }
  if (!catDesc) {
    flag = 1;
    descError.innerText = "*This is a required field.";
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

//ENABLE CONFIRM BUTTON
const confirmButton = document.getElementById("confirm-button");
const catNameInput = document.getElementById("cat-name");
const existingCatName = document.getElementById("cat-name").value.trim();
const catDescInput = document.getElementById("cat-desc");
const existingCatDesc = document.getElementById("cat-desc").value.trim();
catNameInput.addEventListener("input", checkChanges);
catDescInput.addEventListener("input", checkChanges);

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
