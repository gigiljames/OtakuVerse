const form = document.getElementById("login-form");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
  const email = document.getElementById("email-input").value.trim();
  const emailError = document.getElementById("email-error");
  if (!emailRegex.test(email)) {
    flag = 1;
    emailError.innerText = "Please enter a valid email.";
  }
  if (!email) {
    flag = 1;
    emailError.innerText = "Please enter your email.";
  }
  if (flag === 0) {
    $.ajax({
      url: "/forgotpassword",
      type: "POST",
      data: {
        email: email,
      },
      success: function (response) {
        if (response.success) {
          alert(response.message);
        } else {
          emailError.innerText = response.message;
        }
        if (response.redirectUrl) {
          window.location.href = response.redirectUrl;
        }
      },
      error: function (response) {
        console.log(error);
      },
    });
  }
});
