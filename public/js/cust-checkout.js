document.addEventListener("DOMContentLoaded", () => {
  refreshBill();
  handleAddressFunctions();
});

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
      } else if (!/^[a-zA-Z\s]+$/.test(name)) {
        flag = 1;
        nameError.innerText = "Name should contain only letters and spaces.";
      }
      if (!phno) {
        flag = 1;
        phnoError.innerText = "Please enter the phone number.";
      } else if (!/^[6-9][0-9]{9}$/.test(phno)) {
        flag = 1;
        phnoError.innerText = "Please enter a valid Indian phone number.";
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
      } else if (!/^[1-9][0-9]{5}$/.test(pin)) {
        flag = 1;
        pinError.innerText = "Please enter a valid Indian PIN number.";
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
                alert(
                  response.message,
                  "error",
                  () => {
                    if (response.redirectUrl) {
                      window.location.href = response.redirectUrl;
                    }
                  },
                  3000
                );
              }
            }
          },
          error: function (error) {},
        });
      }
    });
  });
}

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
            alert(
              response.message,
              "error",
              () => {
                if (response.redirectUrl) {
                  window.location.href = response.redirectUrl;
                }
              },
              3000
            );
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

function orderButtonHandler() {
  const orderButtons = document.querySelectorAll(".order-button");

  orderButtons.forEach((orderButton) => {
    orderButton.addEventListener("click", () => {
      let flag = 0;
      let addressID = document.querySelector("input[name='address']:checked");
      if (!addressID) {
        flag = 1;
        alert("Please add an address.", "error");
      }
      addressID = addressID.value;

      const paymentMethod = document.querySelector(
        "input[name='paymentMethod']:checked"
      ).value;
      const amount = orderButton.dataset.amount;
      if (flag === 0) {
        if (paymentMethod !== "razorpay") {
          $.ajax({
            type: "POST",
            url: `/place-order/?method=${paymentMethod}`,
            data: { addressID, amount },
            success: function (response) {
              if (response.success) {
                if (response.message) {
                  alert(
                    response.message,
                    "success",
                    () => {
                      window.location.href = response.redirectUrl;
                    },
                    3000
                  );
                }
              } else {
                if (response.message) {
                  alert(
                    response.message,
                    "error",
                    () => {
                      if (response.redirectUrl) {
                        window.location.href = response.redirectUrl;
                      }
                    },
                    3000
                  );
                }
              }
            },
            error: function (error) {},
          });
        } else if (paymentMethod === "razorpay") {
          $.ajax({
            url: "/create-order",
            type: "POST",
            data: { addressID, amount },
            success: function (response) {
              if (response.success) {
                // const options = {
                //   callback_url: "http://localhost:3000/payment-success", // Your success URL
                //   prefill: {
                //     name: "Gaurav Kumar",
                //     email: "gaurav.kumar@example.com",
                //     contact: "9999999999",
                //   },
                // };
                const { DBOrderID } = response;
                var options = {
                  key: "" + response.key_id + "",
                  amount: "" + response.amount + "",
                  currency: "INR",
                  name: "OtakuVerse",
                  description: "Order payment",
                  order_id: "" + response.order_id + "",
                  handler: function (response) {
                    alert(`Payment completed successfully.`, "success", () => {
                      $.ajax({
                        url: `/edit-payment-status/${DBOrderID}?status=completed`,
                        type: "PATCH",
                        success: function (response) {
                          if (response.success && response.redirectUrl) {
                            window.location.href = "/orders";
                          }
                        },
                      });
                    });
                  },
                  theme: {
                    color: "#7BC9E8",
                  },
                };
                var razorpayObject = new Razorpay(options);
                razorpayObject.on("payment.failed", function (response) {
                  alert(
                    "Payment failed.",
                    "error",
                    () => {
                      $.ajax({
                        url: `/edit-payment-status/${DBOrderID}?status=failed`,
                        type: "PATCH",
                        success: function (response) {
                          if (response.success && response.redirectUrl) {
                            window.location.href = "/orders";
                          }
                        },
                      });
                    },
                    3000
                  );
                });
                razorpayObject.open();
              } else {
                alert(
                  response.message,
                  "error",
                  () => {
                    if (response.redirectUrl) {
                      window.location.href = response.redirectUrl;
                    }
                  },
                  3000
                );
              }
            },
          });
        }
      }
    });
  });
}

const couponCards = document.querySelectorAll(".coupon-card");

couponCards.forEach((card) => {
  const applyButton = card.querySelector(".apply-coupon-button");
  applyButton.addEventListener("click", () => {
    const applyButtons = document.querySelectorAll(".apply-coupon-button");
    applyButtons.forEach((button) => {
      button.style.display = "block";
    });
    const couponID = applyButton.dataset.id;
    $.ajax({
      url: `/apply-coupon/${couponID}`,
      type: "PATCH",
      success: async function (response) {
        if (response.success) {
          await refreshBill();
          const couponRow = document.querySelector("#coupon-row");
          const removeButton = couponRow.querySelector("#remove-coupon-button");
          couponRow.style.display = "flex";
          applyButton.style.display = "none";

          removeButton.addEventListener("click", () => {
            $.ajax({
              url: `/remove-coupon`,
              type: "PATCH",
              success: function (response) {
                if (response.success) {
                  refreshBill();
                  applyButton.style.display = "block";
                  couponRow.style.display = "none";
                }
              },
            });
          });
        } else {
          alert(response.message, "error");
        }
      },
    });
  });
});

async function refreshBill() {
  await $.ajax({
    type: "GET",
    url: "/refresh-bill",
    success: function (response) {
      if (response.success) {
        updateBill(response.bill);
        paymentMethodHandler(response.bill.grand_total);
        orderButtonHandler();
      }
    },
  });
}

function updateBill(bill) {
  const billSection = document.querySelector(".bill-section");
  billSection.innerHTML = "";
  const billDiv = document.createElement("div");
  billDiv.classList.add("bill");
  billDiv.innerHTML = `<div class="bill-title">Bill</div>
              <ul><li>
                  <span>Subtotal</span>
                  <span id="subtotal">${bill.subtotal}</span>
                </li>
                <li>
                  <span>Delivery Charges</span>
                  <span id="delivery-charges">${bill.delivery_charges}</span>
                </li>
                <li>
                  <span>Total</span>
                  <span id="total">${bill.total}</span>
                </li>
                <li><span>Discount</span>
                  <span id="discount">${bill.discount}</span>
                </li>
                <li><span>Free Delivery</span>
                  <span id="free-delivery">${bill.free_delivery}</span>
                </li>
                <li id="coupon-row">
                  <span>Coupon applied</span>
                  <button id="remove-coupon-button">REMOVE</button>
                  <span>${bill.coupon_discount}</span>
                </li>
                <li><span>Grand Total</span>
                  <span id="grand-total">${bill.grand_total}</span>
                </li>
                <li><span>You save</span> <span id="you-save">${bill.you_save}</span><span id="you-save-percent"> (${bill.you_save_percent}%)</span>
                  <span></span>
                </li></ul>
              <button class="order-button" data-amount="${bill.grand_total}">Place your order</button>`;
  billSection.appendChild(billDiv);
}

function paymentMethodHandler(amount) {
  const codCard = document.querySelector(".cod-card");
  if (amount < 1000) {
    codCard.style.display = "flex";
  } else {
    codCard.style.display = "none";
  }
}
