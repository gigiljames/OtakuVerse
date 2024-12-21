function handleAddressFunctions() {
  let addressCards = document.querySelectorAll(".address-card");
  addressCards.forEach((addressCard, index) => {
    const errorContainers = addressCard.querySelectorAll(".error-container");
    function clearErrors() {
      for (let i = 0; i < errorContainers.length; i++) {
        errorContainers[i].innerText = "";
      }
    }
    const editButton = addressCard.querySelector(".edit-address-button");
    const deleteButton = addressCard.querySelector(".delete-address-button");
    const saveButton = addressCard.querySelector(".save-address-button");
    const cancelButton = addressCard.querySelector(".cancel-address-button");
    const editButtonGroup = addressCard.querySelector(".edit-address-group");
    const noEditButtonGroup = addressCard.querySelector(".save-address-group");
    editButton.addEventListener("click", () => {
      editButtonGroup.style.display = "none";
      noEditButtonGroup.style.display = "flex";
      const addressInputs = addressCard.querySelectorAll(".address-input");
      const addressDatas = addressCard.querySelectorAll(".address-data");
      addressInputs.forEach((addressInput) => {
        addressInput.style.display = "flex";
      });
      addressDatas.forEach((addressData) => {
        addressData.style.display = "none";
      });
      errorContainers.forEach((errorContainer) => {
        errorContainer.style.display = "block";
      });
    });
    cancelButton.addEventListener("click", () => {
      clearErrors();
      editButtonGroup.style.display = "initial";
      noEditButtonGroup.style.display = "none";
      const addressInputs = addressCard.querySelectorAll(".address-input");
      const addressDatas = document.querySelectorAll(".address-data");
      addressInputs.forEach((addressInput) => {
        addressInput.style.display = "none";
      });
      addressDatas.forEach((addressData) => {
        addressData.style.display = "initial";
      });
      errorContainers.forEach((errorContainer) => {
        errorContainer.style.display = "none";
      });
    });
    saveButton.addEventListener("click", () => {
      clearErrors();
      const name = addressCard.querySelector(".name-input").value.trim();
      const phno = addressCard.querySelector(".phno-input").value.trim();
      const apt = addressCard.querySelector(".apt-input").value.trim();
      const street = addressCard.querySelector(".street-input").value.trim();
      const city = addressCard.querySelector(".city-input").value.trim();
      const state = addressCard.querySelector(".state-input").value.trim();
      const pin = addressCard.querySelector(".pin-input").value.trim();
      const nameError = addressCard.querySelector(".name-error");
      const phnoError = addressCard.querySelector(".phno-error");
      const aptError = addressCard.querySelector(".apt-error");
      const streetError = addressCard.querySelector(".street-error");
      const cityError = addressCard.querySelector(".city-error");
      const stateError = addressCard.querySelector(".state-error");
      const pinError = addressCard.querySelector(".pin-error");
      let flag = 0;
      if (!name) {
        flag = 1;
        nameError.innerText = "Please enter the recipient's name.";
      }
      if (!phno) {
        flag = 1;
        phnoError.innerText = "Please enter the phone number.";
      }
      if (!apt) {
        flag = 1;
        aptError.innerText = "Please enter the apartment name.";
      }
      if (!street) {
        flag = 1;
        streetError.innerText = "Please enter the street.";
      }
      if (!city) {
        flag = 1;
        cityError.innerText = "Please enter the city.";
      }
      if (!state) {
        flag = 1;
        stateError.innerText = "Please enter the state.";
      }
      if (!pin) {
        flag = 1;
        pinError.innerText = "Please enter the pincode.";
      }
      if (flag === 0) {
        const addressID = saveButton.dataset.id;
        $.ajax({
          url: `/edit-address/${addressID}`,
          type: "PATCH",
          data: { name, phno, apt, street, city, state, pin },
          success: function (response) {
            if (response.success) {
              if (response.message) {
                alert(response.message, "success");
                editButtonGroup.style.display = "initial";
                noEditButtonGroup.style.display = "none";
                const addressInputs =
                  addressCard.querySelectorAll(".address-input");
                const addressDatas = document.querySelectorAll(".address-data");
                addressInputs.forEach((addressInput, index) => {
                  addressInput.setAttribute("value", addressInput.value.trim());
                  addressDatas[index].innerText = addressInput.value.trim();
                  addressInput.style.display = "none";
                });
                addressDatas.forEach((addressData) => {
                  addressData.style.display = "initial";
                });
                errorContainers.forEach((errorContainer) => {
                  errorContainer.style.display = "none";
                });
              }
            } else {
              if (response.message) {
                alert(response.message, "error");
              }
            }
          },
          error: function (error) {},
        });
      }
    });
    deleteButton.addEventListener("click", (event) => {
      const addressID = deleteButton.dataset.id;
      console.log(addressID);
      $.ajax({
        url: `/delete-address/${addressID}`,
        type: "DELETE",
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
          addressCard.remove();
        },
        error: function (error) {},
      });
    });
  });
}

handleAddressFunctions();

//EDIT DETAILS BUTTON HANDLING
const errorContainersGen = document.querySelectorAll(
  ".general-info-card .error-container"
);
function clearErrors() {
  for (let i = 0; i < errorContainersGen.length; i++) {
    errorContainersGen[i].innerText = "";
  }
}
const genInputContainer = document.querySelector(
  ".general-info-card .input-container"
);
const editDetailsButton = document.querySelector(".edit-details-button");
const saveDetailsButton = genInputContainer.querySelector(
  ".save-details-button"
);
const cancelDetailsButton = genInputContainer.querySelector(
  ".cancel-details-button"
);
const editDetailsGroup = genInputContainer.querySelector(".edit-details-group");
const noEditDetailsGroup = genInputContainer.querySelector(
  ".save-details-group"
);
const editDetailsInput = genInputContainer.querySelector("input");
const editDetailsData = genInputContainer.querySelector(".gen-info-data");

editDetailsButton.addEventListener("click", () => {
  editDetailsGroup.style.display = "none";
  noEditDetailsGroup.style.display = "flex";
  errorContainersGen.forEach((errorContainer) => {
    errorContainer.style.display = "block";
  });
  editDetailsInput.style.display = "block";
  editDetailsData.style.display = "none";
});
cancelDetailsButton.addEventListener("click", () => {
  clearErrors();
  editDetailsGroup.style.display = "initial";
  noEditDetailsGroup.style.display = "none";
  errorContainersGen.forEach((errorContainer) => {
    errorContainer.style.display = "none";
  });
  editDetailsInput.style.display = "none";
  editDetailsData.style.display = "block";
});
saveDetailsButton.addEventListener("click", () => {
  clearErrors();
  const name = document.getElementById("name-input").value.trim();
  const nameError = document.getElementById("name-error");
  let flag = 0;
  if (!name) {
    flag = 1;
    nameError.innerText = "Name field cannot be left empty.";
  }
  if (flag === 0) {
    $.ajax({
      type: "PATCH",
      url: "/edit-details",
      data: { name },
      success: function (response) {
        if (response.success) {
          if (response.message) {
            alert(response.message, "success");
            clearErrors();
            editDetailsGroup.style.display = "initial";
            noEditDetailsGroup.style.display = "none";
            editDetailsInput.style.display = "none";
            editDetailsInput.innerText = name;
            editDetailsData.style.display = "block";

            editDetailsData.innerText = name;

            errorContainersGen.forEach((errorContainer) => {
              errorContainer.style.display = "none";
            });
          }
        } else {
          if (response.message) {
            alert(response.message, "error");
          }
        }
      },
      error: function (error) {},
    });
  }
});

const addForm = document.getElementById("add-form");
const addFormOuter = document.getElementsByClassName("add-form-outer")[0];
//ADD FORM BUTTONS
const closeButton = document.getElementsByClassName("close-button")[0];
const addButton = document.getElementsByClassName("add-button")[0];
closeButton.addEventListener("click", (event) => {
  addFormOuter.style.display = "none";
});
addButton.addEventListener("click", (event) => {
  addFormOuter.style.display = "flex";
});

//ADD ADDRESS
addForm.addEventListener("submit", (event) => {
  const errorContainers = addForm.querySelectorAll(".error-container");
  function clearErrors() {
    for (let i = 0; i < errorContainers.length; i++) {
      errorContainers[i].innerText = "";
    }
  }
  event.preventDefault();
  clearErrors();
  const name = addForm.querySelector("#name-input").value.trim();
  const apt = addForm.querySelector("#apt-input").value.trim();
  const city = addForm.querySelector("#city-input").value.trim();
  const pin = addForm.querySelector("#pin-input").value.trim();
  const phno = addForm.querySelector("#phno-input").value.trim();
  const street = addForm.querySelector("#street-input").value.trim();
  const state = addForm.querySelector("#state-input").value.trim();
  const nameError = addForm.querySelector("#name-error");
  const phnoError = addForm.querySelector("#phno-error");
  const aptError = addForm.querySelector("#apt-error");
  const streetError = addForm.querySelector("#street-error");
  const cityError = addForm.querySelector("#city-error");
  const stateError = addForm.querySelector("#state-error");
  const pinError = addForm.querySelector("#pin-error");
  let flag = 0;
  if (!name) {
    flag = 1;
    nameError.innerText = "Please enter the recipient's name.";
  } else if (!/^[a-zA-Z\s]+$/.test(name)) {
    flag = 1;
    nameError.innerText = "Name should contain only letters and spaces.";
  }
  if (!phno) {
    flag = 1;
    phnoError.innerText = "Please enter the phone number.";
  } else if (!/^\d{10}$/.test(phno)) {
    flag = 1;
    phnoError.innerText = "Phone number should be a valid 10-digit number.";
  }
  if (!apt) {
    flag = 1;
    aptError.innerText = "Please enter the apartment name.";
  }
  if (!street) {
    flag = 1;
    streetError.innerText = "Please enter the street.";
  }
  if (!city) {
    flag = 1;
    cityError.innerText = "Please enter the city.";
  } else if (!/^[a-zA-Z\s]+$/.test(city)) {
    flag = 1;
    cityError.innerText = "City should contain only letters and spaces.";
  }
  if (!state) {
    flag = 1;
    stateError.innerText = "Please enter the state.";
  } else if (!/^[a-zA-Z\s]+$/.test(state)) {
    flag = 1;
    stateError.innerText = "State should contain only letters and spaces.";
  }
  if (!pin) {
    flag = 1;
    pinError.innerText = "Please enter the pincode.";
  } else if (!/^\d{6}$/.test(pin)) {
    flag = 1;
    pinError.innerText = "Pincode should be a valid 6-digit number.";
  }

  if (flag === 0) {
    const address = { name, apt, city, pin, phno, street, state };
    $.ajax({
      type: "POST",
      url: "/add-address",
      data: address,
      success: function (response) {
        if (response.success) {
          if (response.message) {
            addFormOuter.style.display = "none";
            alert(response.message, "success");
            updateAddressList(address, response.addressID);
            handleAddressFunctions();
          }
        } else {
          if (response.message) {
            alert(response.message, "error");
          }
        }
      },
      error: function (error) {},
    });
  }
});

function updateAddressList(address, addressID) {
  const addressList = document.querySelector(".address-list");
  const addressCard = document.createElement("div");
  addressCard.classList.add("address-card");
  addressCard.innerHTML = `<div class="input-container">
                  <div class="info-title">Name</div>
                  <div class="address-data">${address.name}</div>
                  <input class="address-input name-input" name="name" type="text" value="${address.name}"/>
                  <div class="error-container name-error"></div>
                </div>
                <div class="input-container">
                  <div class="info-title">Phone number</div>
                  <div class="address-data">${address.phno}</div>
                  <input class="address-input phno-input" name="phno" type="text" value="${address.phno}" />
                  <div class="error-container phno-error"></div>
                </div>
                <div class="input-container">
                  <div class="info-title">Apartment</div>
                  <div class="address-data">${address.apt}</div>
                  <input class="address-input apt-input" name="apt" type="text" value="${address.apt}"/>
                  <div class="error-container apt-error"></div>
                </div>
                <div class="input-container">
                  <div class="info-title">Street/Road</div>
                  <div class="address-data">${address.street}</div>
                  <input class="address-input street-input" name="street" type="text" value="${address.street}"/>
                  <div class="error-container street-error"></div>
                </div>
                <div class="input-container">
                  <div class="info-title">City</div>
                  <div class="address-data">${address.city}</div>
                  <input class="address-input city-input" name="city" type="text" value="${address.city}" />
                  <div class="error-container city-error"></div>
                </div>
                <div class="input-container">
                  <div class="info-title">State</div>
                  <div class="address-data">${address.state}</div>
                  <input class="address-input state-input" name="state" type="text" value="${address.state}"/>
                  <div class="error-container state-error"></div>
                </div>
                <div class="input-container">
                  <div class="info-title">Pincode</div>
                  <div class="address-data">${address.pin}</div>
                  <input class="address-input pin-input" name="pincode" type="text" value="${address.pin}"/>
                  <div class="error-container pin-error"></div>
                </div>
                <div class="button-group edit-address-group">
                  <button class="edit-address-button" tooltip="Edit address"><span class="material-symbols-outlined">
                    edit_square
                    </span></button>
                  <button class="delete-address-button" data-id="${addressID}"><span class="material-symbols-outlined">
                    delete
                    </span></button>
                </div>
                <div class="button-group save-address-group">
                  <div class="inner-group">
                    <button class="save-address-button" data-id="${addressID}">Save</button>
                    <button class="cancel-address-button">Cancel</button>
                  </div>
                  <div class="error-container"></div>
                </div>`;
  addressList.append(addressCard);
}
