document.addEventListener("DOMContentLoaded", () => {
  // ── Cancel full order ──────────────────────────────────────────
  const cancelOrderBtn = document.querySelector(".cancel-order-button");
  if (cancelOrderBtn) {
    cancelOrderBtn.addEventListener("click", async () => {
      if (
        await yes({
          message: "Are you sure you want to cancel this entire order?",
          yesButtonColour: "red",
        })
      ) {
        const orderID = cancelOrderBtn.dataset.id;
        $.ajax({
          type: "DELETE",
          url: `/admin/cancel-order/${orderID}`,
          success: function (response) {
            if (response.success) {
              alert(response.message, "success", () => {
                window.location.reload();
              });
            } else {
              if (response.message) alert(response.message, "error");
              if (response.redirectUrl) window.location.href = response.redirectUrl;
            }
          },
          error: function () {},
        });
      }
    });
  }

  // ── Edit item status ───────────────────────────────────────────
  document.querySelectorAll(".edit-status-btn").forEach((editBtn) => {
    const variantID = editBtn.dataset.variantid;
    const statusRow  = editBtn.closest(".status-row");
    const editRow    = document.getElementById(`status-edit-${variantID}`);
    const statusLabel = document.getElementById(`status-label-${variantID}`);

    editBtn.addEventListener("click", () => {
      statusRow.style.display = "none";
      editRow.style.display   = "flex";
    });

    // Cancel edit
    const cancelEditBtn = editRow.querySelector(".cancel-edit-btn");
    cancelEditBtn.addEventListener("click", () => {
      editRow.style.display   = "none";
      statusRow.style.display = "flex";
    });

    // Save status
    const saveBtn    = editRow.querySelector(".save-status-btn");
    const selectEl   = document.getElementById(`status-select-${variantID}`);
    const orderID    = saveBtn.dataset.orderid;

    saveBtn.addEventListener("click", () => {
      const status = selectEl.value;
      $.ajax({
        type: "PATCH",
        url: `/admin/edit-item-status/${orderID}/${variantID}`,
        data: { status },
        success: function (response) {
          if (response.success) {
            // Update the label text and class
            const allStatusClasses = [
              "status-label-processing", "status-label-shipping",
              "status-label-out-for-delivery", "status-label-delivered",
              "status-label-cancelled", "status-label-waiting-for-return-approval",
              "status-label-return-approved", "status-label-return-rejected",
              "status-label-returned", "status-label-refunded",
            ];
            allStatusClasses.forEach(c => statusLabel.classList.remove(c));
            const newClass = "status-label-" + status.replace(/ /g, "-");
            statusLabel.classList.add(newClass);
            statusLabel.innerText = status;

            // Hide save row, show status row
            editRow.style.display   = "none";
            statusRow.style.display = "flex";

            alert(response.message, "success");
          } else {
            if (response.message) alert(response.message, "error");
            if (response.redirectUrl) window.location.href = response.redirectUrl;
          }
        },
        error: function () {},
      });
    });
  });

  // ── Cancel single item ─────────────────────────────────────────
  document.querySelectorAll(".cancel-item-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (
        await yes({
          message: "Are you sure you want to cancel this item?",
          yesButtonColour: "red",
        })
      ) {
        const orderID   = btn.dataset.orderid;
        const variantID = btn.dataset.variantid;
        $.ajax({
          type: "DELETE",
          url: `/admin/cancel-item/${orderID}/${variantID}`,
          success: function (response) {
            if (response.success) {
              alert(response.message, "success", () => {
                window.location.reload();
              });
            } else {
              if (response.message) alert(response.message, "error");
            }
          },
          error: function () {},
        });
      }
    });
  });
});
