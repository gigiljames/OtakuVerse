const signupForm = document.getElementById("login-form");
const fullNameError = document.getElementById("fullname-error");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const repasswordError = document.getElementById("repassword-error");
const errorContainers = document.getElementsByClassName("error-container");
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

signupForm.addEventListener("submit", (event) => {
  clearErrors();
  const fullName = document.getElementById("fullname-input").value.trim();
  const email = document.getElementById("email-input").value.trim();
  const password = document.getElementById("password-input").value.trim();
  const repassword = document.getElementById("repassword-input").value.trim();
  let flag = 0;
  if (!fullName) {
    flag = 1;
    fullNameError.innerText = "*This field is required.";
  }
  if (!emailRegex.test(email)) {
    flag = 1;
    emailError.innerText = "Please enter a valid email.";
  }
  if (!email) {
    flag = 1;
    emailError.innerText = "*This field is required.";
  }
  if (!passwordRegex.test(password)) {
    flag = 1;
    passwordError.innerText = "Please enter a stronger password.";
  }
  if (password !== repassword) {
    flag = 1;
    passwordError.innerText = "Passwords do not match.";
  }
  if (!password) {
    flag = 1;
    passwordError.innerText = "*This field is required.";
  }
  if (!repassword) {
    flag = 1;
    repasswordError.innerText = "*This field is required.";
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
