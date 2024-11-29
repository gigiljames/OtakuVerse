const loginForm = document.getElementById("login-form");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const errorContainers = document.getElementsByClassName("error-container");

loginForm.addEventListener("submit", (event) => {
  const email = document.getElementById("email-input").value.trim();
  const password = document.getElementById("password-input").value.trim();
  clearErrors();
  let flag = 0;
  if (!email) {
    flag = 1;
    emailError.innerText = "*This field is required.";
  }
  if (!password) {
    flag = 1;
    passwordError.innerText = "*This field is required.";
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
