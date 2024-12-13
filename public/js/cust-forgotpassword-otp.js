const form = document.getElementById("login-form");
const errorContainers = document.getElementsByClassName("error-container");
function clearErrors() {
  for (let i = 0; i < errorContainers.length; i++) {
    errorContainers[i].innerText = "";
  }
}
function validateOtp(otp) {
  if (otp.length === 6 && !isNaN(Number(otp))) {
    return true;
  }
  return false;
}

form.addEventListener("submit", (event) => {
  clearErrors();
  event.preventDefault();
  const otp = document.getElementById("otp-input").value.trim();
  const otpError = document.getElementById("otp-error");
  let flag = 0;
  if (!otp) {
    flag = 1;
    otpError.innerText = "Please enter the OTP.";
  } else if (!validateOtp(otp)) {
    flag = 1;
    otpError.innerText = "Please enter a valid OTP.";
  }
  if (flag === 0) {
    $.ajax({
      url: "/forgotpassword/enter-otp",
      type: "POST",
      data: { otp },
      success: function (response) {
        if (response.success) {
          if (response.message) {
            alert(response.message);
          }
        } else {
          alert(response.message);
          console.log(response.message);
        }
        if (response.redirectUrl) {
          window.location.href = response.redirectUrl;
        }
      },
      error: function (error) {
        // console.log(error);
      },
    });
  }
});

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
  startTimer(5);
  $.ajax({
    type: "GET",
    url: "/forgotpassword/resend-otp",
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
      }
    },
  });
  console.log("Resend OTP request sent.");
});
