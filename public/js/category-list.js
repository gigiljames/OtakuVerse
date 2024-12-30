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
const offerError = document.getElementById("offer-error");

const errorContainers = document.getElementsByClassName("error-container");
function clearErrors() {
  for (let i = 0; i < errorContainers.length; i++) {
    errorContainers[i].innerText = "";
  }
}

addCategoryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearErrors();
  flag = 0;
  const name = document.getElementById("cat-name").value.trim();
  const desc = document.getElementById("cat-desc").value.trim();
  const offer = document.getElementById("cat-offer").value.trim();
  if (!name) {
    flag = 1;
    nameError.innerText = "Enter category name.";
  }
  if (!desc) {
    flag = 1;
    descError.innerText = "Enter category description.";
  }
  if (!offer) {
    flag = 1;
    offerError.innerText = "Enter category offer.";
  } else if (isNaN(offer)) {
    flag = 1;
    offerError.innerText = "Category offer should be a valid number.";
  } else if (Number(offer) < 0 || Number(offer) > 100) {
    flag = 1;
    offerError.innerText = "Category offer should be in the range (0-100).";
  }
  if (flag === 0) {
    $.ajax({
      type: "POST",
      url: "/admin/add-category",
      data: { name, desc, offer },
      success: function (response) {
        if (response.success) {
          if (response.message) {
            alert(response.message, "success");
          }
          addCategoryForm.style.display = "none";
          updateCategoryList(name, response.id);
        } else {
          if (response.message) {
            alert(response.message, "error");
          }
          if (response.redirectUrl) {
            window.location.href = response.redirectUrl;
          }
        }
      },
    });
  }
});

function updateCategoryList(name, id) {
  const categoryList = document.querySelector(".category-list");
  const newCategory = document.createElement("a");
  newCategory.setAttribute("href", `/admin/category/${id}`);
  newCategory.innerHTML = `<div class="category-button">${name}</div>`;
  categoryList.append(newCategory);
}
