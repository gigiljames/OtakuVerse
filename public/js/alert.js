// <%-include("../../partials/alert.ejs")%>

const alert = (
  message = "Success",
  state = "success",
  callback = null,
  time = 4000
) => {
  const alertBox = document.querySelector(".alert");
  alertBox.classList.remove("alert-success");
  alertBox.classList.remove("alert-error");
  const alertIcon = alertBox.querySelector(".alert-icon");
  const closeButton = alertBox.querySelector(".alert-close-button");
  if (state === "success") {
    alertBox.classList.add("alert-success");
    alertIcon.innerText = "check_circle";
  } else if (state === "error") {
    alertBox.classList.add("alert-error");
    alertIcon.innerText = "error";
  }
  const alertMessage = alertBox.querySelector(".alert-message");
  alertMessage.innerText = message;
  alertBox.classList.remove("hide-alert");
  alertBox.classList.add("show-alert");
  const closeTimeout = setTimeout(() => {
    alertBox.classList.add("hide-alert");
    if (callback) {
      callback();
    }
  }, time);
  closeButton.addEventListener("click", () => {
    clearTimeout(closeTimeout);
    alertBox.classList.add("hide-alert");
    if (callback) {
      callback();
    }
  });
};
