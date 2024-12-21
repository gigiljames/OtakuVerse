const form = document.getElementById("login-form");
const errorContainers = document.getElementsByClassName("error-container");
function clearErrors() {
  for (let i = 0; i < errorContainers.length; i++) {
    errorContainers[i].innerText = "";
  }
}

form.addEventListener("submit", (event) => {
  clearErrors();
  event.preventDefault();
  let flag = 0;
  const password = document.getElementById("password-input").value.trim();
  const repassword = document.getElementById("repassword-input").value.trim();
  const passwordError = document.getElementById("password-error");
  const repasswordError = document.getElementById("repassword-error");
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#*?&])[A-Za-z\d@#$!%*?&]{8,}$/;
  if (!password) {
    flag = 1;
    passwordError.innerText = "Please enter a new password.";
  } else if (!passwordRegex.test(password)) {
    flag = 1;
    passwordError.innerText = "Please enter a strong password.";
  }
  if (!repassword) {
    flag = 1;
    repasswordError.innerText = "Please re-enter new password.";
  } else if (password !== repassword) {
    flag = 1;
    repasswordError.innerText = "The passwords doesn't match.";
  }
  if (flag === 0) {
    $.ajax({
      url: "/resetpassword",
      type: "POST",
      data: { password },
      success: function (response) {
        if (response.success) {
          if (response.message) {
            alert(response.message, "success");
          }
        } else {
          if (response.message) {
            alert(response.message, "error");
          }
        }
        if (response.redirectUrl) {
          window.location.href = response.redirectUrl;
        }
      },
      error: function (error) {},
    });
  }
});
