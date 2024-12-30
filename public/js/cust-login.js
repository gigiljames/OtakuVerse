const loginForm = document.getElementById("login-form");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const errorContainers = document.getElementsByClassName("error-container");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("email-input").value.trim();
  const password = document.getElementById("password-input").value.trim();
  clearErrors();
  let flag = 0;
  if (!email) {
    flag = 1;
    emailError.innerText = "Enter your email.";
  }
  if (!password) {
    flag = 1;
    passwordError.innerText = "Enter your password.";
  }
  if (flag === 0) {
    $.ajax({
      url: "/login",
      type: "POST",
      data: { email, password },
      success: function (response) {
        if (response.success) {
          alert(
            response.message,
            "success",
            () => {
              window.location.href = "/";
            },
            1500
          );
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

function clearErrors() {
  for (let i = 0; i < errorContainers.length; i++) {
    errorContainers[i].innerText = "";
  }
}

// const googleButton = document.querySelector(".google-button");
// googleButton.addEventListener("click", (event) => {
//   event.preventDefault();
//   $.ajax({
//     url: "/auth/google",
//     type: "GET",
//     success: function (response) {
//       if (response.success) {
//         alert(
//           response.message,
//           "success",
//           () => {
//             window.location.href = "/";
//           },
//           1500
//         );
//       } else {
//         alert(response.message, "error");
//       }
//     },
//     error: function (error) {},
//   });
// });
