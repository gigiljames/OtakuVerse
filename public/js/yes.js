function yes(options) {
  injectStyles();
  const { message, yesButtonColour } = options;
  const yesButtonText = options.yesButtonText || "Confirm";
  const noButtonText = options.noButtonText || "Cancel";
  const yesOuter = document.createElement("div");
  yesOuter.classList.add("yes-outer");
  let colour = "";
  switch (yesButtonColour) {
    case "red":
      colour = "yes-red";
      break;
    case "green":
      colour = "yes-green";
      break;
  }
  yesOuter.innerHTML = `
    <div class="yes-box">
      <div class="yes-title">
        ${message}
      </div>
      <div class="yes-buttons">
        <button class="no-button"><div>${noButtonText}</div></button>
        <button class="yes-button ${colour}"><div>${yesButtonText}</div></button>
      </div>
    </div>
  `;

  document.body.appendChild(yesOuter);
  const yesButton = yesOuter.querySelector(".yes-button");
  const noButton = yesOuter.querySelector(".no-button");
  return new Promise((resolve, reject) => {
    yesButton.addEventListener("click", (event) => {
      event.preventDefault();
      yesOuter.remove();
      resolve(true);
    });
    noButton.addEventListener("click", (event) => {
      event.preventDefault();
      yesOuter.remove();
      resolve(false);
    });
  });
}

//injecting css function
function injectStyles() {
  if (!document.querySelector("#yes-styles")) {
    const style = document.createElement("style");
    style.id = "yes-styles";
    style.textContent = getStyles();
    document.head.appendChild(style);
  }
}

//css
function getStyles() {
  return `.yes-outer {
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.yes-box {
  /* width: 400px;
  height: 200px; */
  min-width: 300px;
  padding: 60px;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  gap: 40px;
}

.yes-buttons {
  display: flex;
  gap: 20px;
}

.yes-button,
.no-button {
  width: 120px;
  height: 40px;
  border: 0;
  border-radius: 5px;
  font-weight: 500;
  padding: 0;
  color: white;
  font-weight: 600;
}

.yes-button div,
.no-button div {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.yes-button div:hover,
.no-button div:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

.yes-title {
  font-size: 26px;
  font-weight: 700;
  max-width: 400px;
  text-align: center;
}

.no-button {
  background-color: grey;
}

.yes-red {
  background-color: rgb(235, 92, 92);
}

.yes-green {
  background-color: rgb(48, 209, 48);
}
`;
}
