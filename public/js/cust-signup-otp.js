// const timerDisplay = document.getElementById("timer");
const resendBtn = document.getElementById("resend-btn");
const timerText = document.getElementById("timer-text");
let timerInterval;

// Function to start the timer
const startTimer = (durationInSeconds) => {
  clearInterval(timerInterval);
  console.log("Timer set for " + durationInSeconds + "s");
  let remainingTime = durationInSeconds;
  const timerDisplay = document.createElement("span");
  timerDisplay.classList.add("timer");
  timerText.appendChild(timerDisplay);
  timerInterval = setInterval(() => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;

    timerDisplay.innerText = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;

    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      enableResendButton();
    }

    remainingTime--;
  }, 1000);
};

// Start the initial timer
startTimer(5);

// Enable the resend button
const enableResendButton = () => {
  resendBtn.disabled = false;
  resendBtn.classList.add("enabled");
  document.getElementById("timer-text").innerText = "Didn't receive the OTP?";
};

// Resend OTP button click
resendBtn.addEventListener("click", (event) => {
  event.preventDefault();
  resendBtn.disabled = true;
  resendBtn.classList.remove("enabled");
  document.getElementById("timer-text").innerText = "Resend OTP in ";
  startTimer(60);
  $.ajax({
    type: "POST",
    url: "/resend-otp",
    success: function (response) {
      if (response.success) {
        swal({
          icon: "success",
          title: "Resend OTP",
          text: "OTP resent successfully",
          button: false,
          timer: 1500,
        });
      } else {
        swal({
          icon: "error",
          title: "Error",
          text: "An error occured while resending OTP. Please try again",
        });
        if (response.redirectUrl) {
          window.location.href = response.redirectUrl;
        }
      }
    },
  });
  console.log("Resend OTP request sent.");
});

const otpForm = document.getElementById("login-form");
otpForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const otp = document.getElementById("otp-input").value.trim();
  $.ajax({
    type: "POST",
    url: "/verify-otp",
    data: { otp: otp },
    success: function (response) {
      if (response.success) {
        swal({
          icon: "success",
          title: "Verify OTP",
          text: "OTP verified successfully",
          button: false,
          timer: 1500,
        }).then(() => {
          window.location.href = response.redirectUrl;
        });
      } else {
        swal({
          icon: "error",
          title: "Error",
          text: response.message,
        });
        if (response.redirectUrl) {
          window.location.href = response.redirectUrl;
        }
      }
    },
    error: function () {
      swal({
        icon: "error",
        title: "Invalid OTP",
        text: "Please try again",
      });
    },
  });
});
