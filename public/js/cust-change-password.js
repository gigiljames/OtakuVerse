const changePassForm = document.querySelector("#change-password-form");

const errorContainers = document.getElementsByClassName("error-container");
function clearErrors() {
  for (let i = 0; i < errorContainers.length; i++) {
    errorContainers[i].innerText = "";
  }
}

changePassForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearErrors();
  let flag = 0;
  const currpassword = document.getElementById("currpassword").value.trim();
  const newpassword = document.getElementById("newpassword").value.trim();
  const repassword = document.getElementById("repassword").value.trim();
  const currpasswordError = document.getElementById("currpassword-error");
  const newpasswordError = document.getElementById("newpassword-error");
  const repasswordError = document.getElementById("repassword-error");
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#*?&])[A-Za-z\d@#$!%*?&]{8,}$/;
  if (!currpassword) {
    flag = 1;
    currpasswordError.innerText = "Please enter your current password.";
  }
  if (!newpassword) {
    flag = 1;
    newpasswordError.innerText = "Please enter your new password.";
  } else if (!passwordRegex.test(newpassword)) {
    flag = 1;
    newpasswordError.innerText = "Please enter a stronger password.";
  }
  if (newpassword !== repassword) {
    flag = 1;
    repasswordError.innerText = "Passwords do not match.";
  }
  if (!repassword) {
    flag = 1;
    repasswordError.innerText = "Please re-enter your new password.";
  }
  if (flag === 0) {
    const formData = {
      currpassword: currpassword,
      newpassword: newpassword,
    };
    $.ajax({
      url: "/change-password",
      type: "POST",
      data: formData,
      success: function (response) {
        if (response.success) {
          alert(response.message);
          window.location.href = response.redirectUrl;
        } else {
          alert(response.message);
          window.location.reload();
        }
      },
    });
  }
});
