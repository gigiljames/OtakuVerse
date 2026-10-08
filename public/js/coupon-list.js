function clearFormErrors(errorContainers) {
  for (let i = 0; i < errorContainers.length; i++) {
    errorContainers[i].innerText = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // ── Search ──────────────────────────────────────────────────────
  const searchButton = document.querySelector(".search-button");
  const searchInput = document.getElementById("search");
  const clearButton = document.querySelector(".clear-button");

  searchButton.addEventListener("click", () => {
    window.location.href = `/admin/coupon-management?offset=1&search=${searchInput.value}`;
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      window.location.href = `/admin/coupon-management?offset=1&search=${searchInput.value}`;
    }
  });

  searchInput.addEventListener("input", () => {
    clearButton.style.display = searchInput.value.trim() !== "" ? "flex" : "none";
  });

  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    clearButton.style.display = "none";
    searchInput.focus();
  });

  // ── Add Coupon Modal ─────────────────────────────────────────────
  const addFormOuter = document.getElementById("add-form-outer");
  const addCloseBtn = document.getElementById("add-close-btn");
  const addButton = document.querySelector(".add-button");

  addButton.addEventListener("click", () => {
    addFormOuter.style.display = "flex";
  });

  addCloseBtn.addEventListener("click", () => {
    addFormOuter.style.display = "none";
  });

  addFormOuter.addEventListener("click", (e) => {
    if (e.target === addFormOuter) addFormOuter.style.display = "none";
  });

  // ── Add Coupon Form Validation ───────────────────────────────────
  const addForm = document.getElementById("add-form");
  const addErrorContainers = addForm.querySelectorAll(".error-container");

  addForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFormErrors(addErrorContainers);

    const title       = document.getElementById("title-input").value.trim();
    const description = document.getElementById("desc-input").value.trim();
    const code        = document.getElementById("code-input").value.trim().toUpperCase();
    const value       = document.getElementById("value-input").value.trim();
    const type        = document.getElementById("type-input").value.trim();
    const availability = document.getElementById("availability-input").value.trim();
    const minSpent    = document.getElementById("minspent-input").value.trim();
    const uses        = document.getElementById("uses-input").value.trim();

    let flag = 0;
    if (!title) { flag = 1; document.getElementById("title-error").innerText = "Enter the title."; }
    if (!description) { flag = 1; document.getElementById("desc-error").innerText = "Enter the description."; }
    if (!code) { flag = 1; document.getElementById("code-error").innerText = "Enter the code."; }
    if (!value || isNaN(value) || Number(value) <= 0) { flag = 1; document.getElementById("value-error").innerText = "Enter a positive number."; }
    if (!type) { flag = 1; document.getElementById("type-error").innerText = "Select a type."; }
    if (!availability) { flag = 1; document.getElementById("availability-error").innerText = "Select availability."; }
    if (!minSpent || isNaN(minSpent) || Number(minSpent) <= 0) { flag = 1; document.getElementById("minspent-error").innerText = "Enter a valid amount."; }
    if (!uses || isNaN(uses) || Number(uses) <= 0 || Number(uses) > 10) { flag = 1; document.getElementById("uses-error").innerText = "Enter a number between 1 and 10."; }

    if (flag === 0) {
      $.ajax({
        url: "/admin/add-coupon",
        type: "POST",
        data: { title, description, code, value, type, availability, minSpent, uses },
        success: function (response) {
          if (response.success) {
            addFormOuter.style.display = "none";
            alert(response.message, "success", () => { window.location.reload(); });
          } else {
            if (response.message) alert(response.message, "error");
            if (response.redirectUrl) window.location.href = response.redirectUrl;
          }
        },
        error: function () {},
      });
    }
  });

  // ── Edit Coupon Modal ────────────────────────────────────────────
  const editFormOuter = document.getElementById("edit-form-outer");
  const editCloseBtn  = document.getElementById("edit-close-btn");
  let activeCouponId  = null;

  editCloseBtn.addEventListener("click", () => {
    editFormOuter.style.display = "none";
  });

  editFormOuter.addEventListener("click", (e) => {
    if (e.target === editFormOuter) editFormOuter.style.display = "none";
  });

  document.querySelectorAll(".edit-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCouponId = btn.dataset.id;

      // Populate edit modal from data attributes
      document.getElementById("edit-title-input").value    = btn.dataset.title   || "";
      document.getElementById("edit-desc-input").value     = btn.dataset.desc    || "";
      document.getElementById("edit-code-input").value     = btn.dataset.code    || "";
      document.getElementById("edit-value-input").value    = btn.dataset.value   || "";
      document.getElementById("edit-minspent-input").value = btn.dataset.minspent || "";
      document.getElementById("edit-uses-input").value     = btn.dataset.uses    || "";

      const typeSelect = document.getElementById("edit-type-input");
      typeSelect.value = btn.dataset.type; // "true" or "false"

      // Clear any lingering errors
      clearFormErrors(editFormOuter.querySelectorAll(".error-container"));

      editFormOuter.style.display = "flex";
    });
  });

  // ── Edit Coupon Form Submit ──────────────────────────────────────
  const editForm = document.getElementById("edit-form");

  editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFormErrors(editFormOuter.querySelectorAll(".error-container"));

    const title    = document.getElementById("edit-title-input").value.trim();
    const desc     = document.getElementById("edit-desc-input").value.trim();
    const code     = document.getElementById("edit-code-input").value.trim().toUpperCase();
    const value    = document.getElementById("edit-value-input").value.trim();
    const type     = document.getElementById("edit-type-input").value;
    const minSpent = document.getElementById("edit-minspent-input").value.trim();
    const uses     = document.getElementById("edit-uses-input").value.trim();

    const errors = [];
    if (!title)  errors.push({ id: "edit-title-error",    msg: "Title is required." });
    if (!desc)   errors.push({ id: "edit-desc-error",     msg: "Description is required." });
    if (!code)   errors.push({ id: "edit-code-error",     msg: "Code is required." });
    if (!value || isNaN(value) || Number(value) <= 0) errors.push({ id: "edit-value-error", msg: "Enter a positive number." });
    if (!minSpent || isNaN(minSpent) || Number(minSpent) < 0) errors.push({ id: "edit-minspent-error", msg: "Enter a valid amount." });
    if (!uses || isNaN(uses) || Number(uses) <= 0) errors.push({ id: "edit-uses-error", msg: "Enter a positive number." });

    if (errors.length > 0) {
      errors.forEach(({ id, msg }) => {
        const el = document.getElementById(id);
        if (el) el.innerText = msg;
      });
      return;
    }

    $.ajax({
      url: `/admin/edit-coupon/${activeCouponId}`,
      type: "PATCH",
      data: { title, desc, code, value, type, minSpent, uses },
      success: function (response) {
        if (response.success) {
          editFormOuter.style.display = "none";
          alert(response.message, "success", () => { window.location.reload(); }, 1500);
        } else {
          alert(response.message, "error");
        }
      },
      error: function () {},
    });
  });

  // ── Delete Coupon ────────────────────────────────────────────────
  document.querySelectorAll(".delete-button").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (await yes({ message: "Are you sure you want to delete this coupon?", yesButtonColour: "red" })) {
        const couponID = btn.dataset.id;
        $.ajax({
          url: `/admin/delete-coupon/${couponID}`,
          type: "DELETE",
          success: function (response) {
            if (response.success) {
              alert(response.message, "success", () => {
                btn.closest(".coupon-card").remove();
              });
            } else {
              alert(response.message, "error");
            }
          },
          error: function () {},
        });
      }
    });
  });
});
