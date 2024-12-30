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
  const tbody = document.querySelector("tbody");
  if (mode === "initial") {
    tbody.innerHTML = "";
  }

  if (coupons.length === 0) {
    let row = document.createElement("tr");
    row.innerHTML = "<td colspan='7'>Nothing to show here.</td>";
  } else {
    coupons.forEach((coupon) => {
      let row = document.createElement("tr");
      let type;
      if (coupon.is_percentage) {
        type = "Percentage";
      } else {
        type = "Flat";
      }
      let availability;
      let availabilityButton;
      if (coupon.is_enabled) {
        availability = "Enabled";
        availabilityButton = `<button class="block-button" data-id="${coupon._id}">Disable</button>`;
      } else {
        availability = "Disabled";
        availabilityButton = `<button class="unblock-button" data-id="${coupon._id}">Enable</button>`;
      }
      // <td>${availability}</td>
      //   <td>
      //     ${availabilityButton}
      //   </td>
      row.innerHTML = `
        <td>${coupon.title}</td>
        <td>${coupon.code}</td>
        <td>${coupon.value}</td>
        <td>${type}</td>
        
        <td>
          <button class="edit-button" data-id="${coupon._id}">
            <span class="material-symbols-outlined">
            edit
            </span>
          </button>
        </td>
        <td>
          <button class="delete-button" data-id="${coupon._id}">
            <span class="material-symbols-outlined">
            delete
            </span>
          </button>
        </td>
        `;
      tbody.append(row);
    });
    //COUPON OPERATIONS
    const rows = document.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const deleteButton = row.querySelector(".delete-button");
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
                  row.remove();
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
}
