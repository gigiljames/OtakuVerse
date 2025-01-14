function clearErrors(errorContainers) {
  for (let i = 0; i < errorContainers.length; i++) {
    errorContainers[i].innerText = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  //SEARCH
  queryCoupons();
  const searchButton = document.querySelector(".search-button");
  searchButton.addEventListener("click", () => {
    queryCoupons();
  });
  const searchInput = document.getElementById("search");
  const clearButton = document.querySelector(".clear-button");
  searchInput.addEventListener("input", () => {
    if (searchInput.value.trim() !== "") {
      clearButton.style.display = "block";
    } else {
      clearButton.style.display = "none";
    }
  });
  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    clearButton.style.display = "none";
    searchInput.focus();
  });
  // const sortButton = document.querySelector(".sort-button");
  // sortButton.addEventListener("click", () => {
  //   queryCoupons();
  // });
  const addFormOuter = document.getElementsByClassName("add-form-outer")[0];

  //PAGINATION LINKS
  const paginationLinks = document.querySelectorAll(".pagination-links a");
  paginationLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const offset = link.dataset.offset;
      queryCoupons(offset);
    });
  });

  //ADD FORM BUTTONS

  const closeButton = document.getElementsByClassName("close-button")[0];
  const addButton = document.getElementsByClassName("add-button")[0];

  closeButton.addEventListener("click", (event) => {
    addFormOuter.style.display = "none";
  });
  addButton.addEventListener("click", (event) => {
    addFormOuter.style.display = "flex";
  });

  //ADD FORM VALIDATION

  const addForm = document.getElementById("add-form");
  const errorContainers = document.getElementsByClassName("error-container");

  addForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors(errorContainers);
    const title = document.getElementById("title-input").value.trim();
    const description = document.getElementById("desc-input").value.trim();
    const code = document
      .getElementById("code-input")
      .value.trim()
      .toUpperCase();
    const value = document.getElementById("value-input").value.trim();
    const type = document.getElementById("type-input").value.trim();
    const availability = document
      .getElementById("availability-input")
      .value.trim();
    const minSpent = document.getElementById("minspent-input").value.trim();
    const uses = document.getElementById("uses-input").value.trim();

    let flag = 0;
    if (!title) {
      flag = 1;
      document.getElementById("title-error").innerText = "Enter the title.";
    }
    if (!description) {
      flag = 1;
      document.getElementById("desc-error").innerText =
        "Enter the description.";
    }
    if (!code) {
      flag = 1;
      document.getElementById("code-error").innerText = "Enter the code.";
    }
    if (!value || isNaN(value)) {
      flag = 1;
      document.getElementById("value-error").innerText =
        "Enter a valid number.";
    } else if (Number(value) <= 0) {
      flag = 1;
      document.getElementById("value-error").innerText =
        "Value should be greater than 0.";
    }
    if (!type) {
      flag = 1;
      document.getElementById("type-error").innerText = "Select a type.";
    }
    if (!availability) {
      flag = 1;
      document.getElementById("availability-error").innerText =
        "Select availability.";
    }
    if (!minSpent || isNaN(minSpent)) {
      flag = 1;
      document.getElementById("minspent-error").innerText =
        "Enter a valid number.";
    } else if (Number(minSpent) <= 0) {
      flag = 1;
      document.getElementById("minspent-error").innerText =
        "Minimum spent should be greater than 0.";
    }
    if (!uses || isNaN(uses)) {
      flag = 1;
      document.getElementById("uses-error").innerText = "Enter a valid number.";
    } else if (Number(uses) <= 0 || Number(uses) > 10) {
      flag = 1;
      document.getElementById("uses-error").innerText =
        "Uses per person should be in the range 1-10.";
    }
    if (flag === 0) {
      $.ajax({
        url: "/admin/add-coupon",
        type: "POST",
        data: {
          title,
          description,
          code,
          value,
          type,
          availability,
          minSpent,
          uses,
        },
        success: function (response) {
          if (response.success) {
            addFormOuter.style.display = "none";
            alert(response.message, "success", () => {
              // window.location.reload();
              updateCouponList([response.coupon], "append");
            });
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
});

function queryCoupons(offset = 1) {
  const searchQuery = document.querySelector("#search").value.trim() || "";
  const sortOption = document.querySelector("#sort")?.value.trim() || "";
  $.ajax({
    url: `/admin/get-coupons?search=${searchQuery}&sort=${sortOption}&offset=${offset}`,
    type: "GET",
    success: function (response) {
      if (response.success) {
        updateCouponList(response.couponList);
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

function updateCouponList(coupons, mode = "initial") {
  const couponCards = document.querySelector(".coupon-cards");
  if (mode === "initial") {
    couponCards.innerHTML = "";
  }

  if (coupons.length === 0) {
    couponCards.innerHTML = "Nothing to show here.";
  } else {
    coupons.forEach((coupon) => {
      let card = document.createElement("div");
      card.classList.add("coupon-card");
      let type;
      if (coupon.is_percentage) {
        type = "Percentage";
      } else {
        type = "Flat";
      }
      // let availability;
      // let availabilityButton;
      // if (coupon.is_enabled) {
      //   availability = "Enabled";
      //   availabilityButton = `<button class="block-button" data-id="${coupon._id}">Disable</button>`;
      // } else {
      //   availability = "Disabled";
      //   availabilityButton = `<button class="unblock-button" data-id="${coupon._id}">Enable</button>`;
      // }

      card.innerHTML = `
        <div class="coupon-title">
          <div class="info-data">${coupon.title}</div>
          <input class="info-input input-title" type="text" placeholder="Enter coupon title"/>
        </div>
        <div class="coupon-desc">
          <div class="info-data">${coupon.desc}</div>
          <input class="info-input input-desc" type="text" placeholder="Enter coupon description"/>
        </div>
        <div class="coupon-code">
          <div class="info-data">${coupon.code}</div>
          <input class="info-input input-code" type="text" placeholder="Enter coupon code"/>
        </div>
        <div class="coupon-info-grid">
          <div class="coupon-value info-item">
            <label>Value</label>
            <div class="info-data">${coupon.value}</div>
            <input class="info-input input-value" type="text" placeholder="Enter coupon value"/>
          </div>
          <div class="coupon-type info-item">
            <label>Type</label>
            <div class="info-data type-data">${type}</div>
            <select class="info-input input-type" type="text">
              <option class="percentage" value="true">Percentage</option>
              <option class="flat" value="false">Flat</option>
            </select>
          </div>
          <div class="coupon-min-spent info-item">
            <label>Min spent</label>
            <div class="info-data">${coupon.min_spent}</div>
            <input class="info-input input-min-spent" type="text" placeholder="Enter minimum spent"/>
          </div>
          <div class="coupon-uses info-item">
            <label>Uses per person</label>
            <div class="info-data">${coupon.uses_per_person}</div>
            <input class="info-input input-uses" type="text" placeholder="Enter uses per person"/>
          </div>
        </div>
        
          <div class="button-group edit-group">
            <button class="edit-button">
              <span class="material-symbols-outlined">
              edit
              </span>
            </button>
            <button class="delete-button" data-id="${coupon._id}">
              <span class="material-symbols-outlined">
              delete
              </span>
            </button>
          </div>
          <div class="button-group save-group">
            <button class="save-button" data-id="${coupon._id}">
              <span class="material-symbols-outlined">
              check
              </span>
            </button>
            <button class="cancel-button" >
              <span class="material-symbols-outlined">
              close
              </span>
            </button>
          </div>
        `;
      couponCards.append(card);
    });
    setupCouponFunctions();
  }
}

function setupCouponFunctions() {
  const couponCards = document.querySelectorAll(".coupon-card");
  couponCards.forEach((card) => {
    const saveGroup = card.querySelector(".save-group");
    const editGroup = card.querySelector(".edit-group");
    const infoInputs = card.querySelectorAll(".info-input");
    const infoDatas = card.querySelectorAll(".info-data");
    const editButton = card.querySelector(".edit-button");
    editButton.addEventListener("click", () => {
      for (let i = 0; i < infoInputs.length; i++) {
        if (infoDatas[i].classList.contains("type-data")) {
          switch (infoDatas[i].innerText) {
            case "Percentage":
              infoInputs[i]
                .querySelector(".percentage")
                .setAttribute("selected", "selected");
              break;
            case "Flat":
              infoInputs[i]
                .querySelector(".flat")
                .setAttribute("selected", "selected");
              break;
          }
        } else {
          infoInputs[i].value = infoDatas[i].innerText;
        }
        infoDatas[i].style.display = "none";
        infoInputs[i].style.display = "block";
      }
      saveGroup.style.visibility = "visible";
      editGroup.style.visibility = "hidden";
    });
    const cancelButton = card.querySelector(".cancel-button");
    cancelButton.addEventListener("click", () => {
      infoDatas.forEach((data) => {
        data.style.display = "block";
      });
      infoInputs.forEach((input) => {
        input.style.display = "none";
      });
      saveGroup.style.visibility = "hidden";
      editGroup.style.visibility = "visible";
    });
    const saveButton = card.querySelector(".save-button");
    saveButton.addEventListener("click", () => {
      // Extracting input values
      const title = card.querySelector(".input-title").value.trim();
      const desc = card.querySelector(".input-desc").value.trim();
      const code = card.querySelector(".input-code").value.trim();
      const value = card.querySelector(".input-value").value.trim();
      const type = card.querySelector(".input-type").value; //
      const minSpent = card.querySelector(".input-min-spent").value.trim();
      const uses = card.querySelector(".input-uses").value.trim();

      // Validation object to collect errors
      const validationErrors = [];

      // Validation logic
      if (!title) validationErrors.push("Title is required.");
      if (!desc) validationErrors.push("Description is required.");
      if (!code) validationErrors.push("Code is required.");
      if (!value || isNaN(value) || Number(value) <= 0)
        validationErrors.push("Value must be a positive number.");
      if (type !== "true" && type !== "false")
        validationErrors.push("Type must be either Percentage or Flat.");
      if (!minSpent || isNaN(minSpent) || Number(minSpent) < 0)
        validationErrors.push("Minimum spent must be a non-negative number.");
      if (!uses || isNaN(uses) || Number(uses) <= 0)
        validationErrors.push("Uses per person must be a positive number.");
      if (validationErrors.length > 0) {
        alert(validationErrors.join("\n"), "error", null, 6000);
      } else {
        const couponID = saveButton.dataset.id;
        $.ajax({
          url: `/admin/edit-coupon/${couponID}`,
          type: "PATCH",
          data: { title, desc, code, value, type, minSpent, uses },
          success: function (response) {
            if (response.success) {
              alert(
                response.message,
                "success",
                () => {
                  queryCoupons();
                  infoDatas.forEach((data) => {
                    data.style.display = "block";
                  });
                  infoInputs.forEach((input) => {
                    input.style.display = "none";
                  });
                  saveGroup.style.visibility = "hidden";
                  editGroup.style.visibility = "visible";
                },
                1500
              );
            } else {
              alert(response.message, "error");
            }
          },
          error: function (error) {},
        });
      }
    });
    const deleteButton = card.querySelector(".delete-button");
    deleteButton.addEventListener("click", async () => {
      if (
        await yes({
          message: "Are you sure you want to delete this coupon?",
          yesButtonColour: "red",
        })
      ) {
        const couponID = deleteButton.dataset.id;
        $.ajax({
          url: `/admin/delete-coupon/${couponID}`,
          type: "DELETE",
          success: function (response) {
            if (response.success) {
              alert(response.message, "success", () => {
                card.remove();
              });
            } else {
              alert(response.message, "error");
            }
          },
          error: function (error) {},
        });
      }
    });
  });
}
