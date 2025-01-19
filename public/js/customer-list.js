document.addEventListener("DOMContentLoaded", () => {
  //SEARCH
  const searchButton = document.querySelector(".search-button");
  searchButton.addEventListener("click", () => {
    window.location.href = `/admin/customer-management?offset=1&search=${searchInput.value}`;
  });
  const searchInput = document.getElementById("search");
  const clearButton = document.querySelector(".clear-button");
  searchInput.addEventListener("input", () => {
    if (searchInput.value.trim() !== "") {
      clearButton.style.display = "block";
    } else {
      clearButton.style.display = "none";
    }
  });
  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    clearButton.style.display = "none";
    searchInput.focus();
  });
  // const sortButton = document.querySelector(".sort-button");
  // sortButton.addEventListener("click", () => {
  //   queryCustomers();
  // });
  const addFormOuter = document.getElementsByClassName("add-form-outer")[0];

  //PAGINATION LINKS
  const paginationLinks = document.querySelectorAll(".pagination-links a");
  paginationLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const offset = link.dataset.offset;
      // queryCustomers(offset);
    });
  });

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
  const fullNameError = document.getElementById("fullname-error");
  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");
  const repasswordError = document.getElementById("repassword-error");
  const errorContainers = document.getElementsByClassName("error-container");
  function clearErrors() {
    for (let i = 0; i < errorContainers.length; i++) {
      errorContainers[i].innerText = "";
    }
  }
  // const passwordRegex =
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  addForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();
    const fullName = document.getElementById("fullname-input").value.trim();
    const email = document.getElementById("email-input").value.trim();
    const password = document.getElementById("password-input").value.trim();
    const status = document.getElementById("status-input").value.trim();
    let flag = 0;
    if (!fullName) {
      flag = 1;
      fullNameError.innerText = "Enter the user's name.";
    }
    if (!emailRegex.test(email)) {
      flag = 1;
      emailError.innerText = "Please enter a valid email.";
    }
    if (!email) {
      flag = 1;
      emailError.innerText = "Enter the user's email.";
    }
    // if (!passwordRegex.test(password)) {
    //   flag = 1;
    //   passwordError.innerText = "Please enter a stronger password.";
    // }
    if (!password) {
      flag = 1;
      passwordError.innerText = "Create a password.";
    }
    // if (!status) {
    //   flag = 1;
    //   repasswordError.innerText = "*This field is required.";
    // }
    if (flag === 0) {
      $.ajax({
        url: "/admin/add-customer",
        type: "POST",
        data: { name: fullName, email, password, status },
        success: function (response) {
          if (response.success) {
            addFormOuter.style.display = "none";
            alert(response.message, "success", () => {
              window.location.reload();
              // queryCustomers();/
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
        error: function (error) {},
      });
    }
  });
});

function handleStatus(custID) {
  const button = document.querySelector(`#button-${custID}`);
  const visible = button.dataset.status;
  if (visible === "active") {
    $.ajax({
      url: `/admin/block-customer/${custID}`,
      type: "PATCH",
      success: function (response) {
        if (response.success) {
          button.innerText = "Unblock";
          button.dataset.status = "banned";
          const statusData = document.querySelector(`#status-${custID}`);
          statusData.innerText = "banned";
        }
      },
    });
  } else if (visible === "banned") {
    $.ajax({
      url: `/admin/unblock-customer/${custID}`,
      type: "PATCH",
      success: function (response) {
        if (response.success) {
          button.innerText = "Block";
          button.dataset.status = "active";
          const statusData = document.querySelector(`#status-${custID}`);
          statusData.innerText = "active";
        }
      },
    });
  }
}
