const cancelButtons = document.querySelectorAll(".cancel-order-button");

cancelButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const orderID = button.dataset.id;
    const orderRow = document.querySelector(`.order-${orderID}`);
    const status = orderRow.querySelector(".status-data");
    const statusEditContainer = orderRow.querySelector(
      ".status-edit-container"
    );
    if (
      await yes({
        message: "Are you sure you want to cancel this order?",
        yesButtonColour: "red",
      })
    ) {
      $.ajax({
        type: "DELETE",
        url: `/admin/cancel-order/${orderID}`,
        success: function (response) {
          if (response.success) {
            alert(response.message, "success", () => {
              window.location.reload();
            });
            // status.innerText = "Cancelled";
            // button.remove();
            // statusEditContainer.remove();
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

const itemCards = document.querySelectorAll(".item-card");
itemCards.forEach((card) => {
  const editStatusButton = card.querySelector(".edit-status-button");
  if (!editStatusButton) {
    return;
  }
  editStatusButton.addEventListener("click", () => {
    const orderID = editStatusButton.dataset.orderid;
    const variantID = editStatusButton.dataset.variantid;
    // const orderRow = document.querySelector(`.order-${orderID}`);
    const statusInput = card.querySelector(".status-input");
    const statusData = card.querySelector(".status-data .data-data");
    const saveButton = card.querySelector(".save-status-button");
    editStatusButton.style.display = "none";
    saveButton.style.display = "block";
    statusInput.style.display = "block";
    statusData.style.display = "none";
    saveButton.addEventListener("click", () => {
      const status = statusInput.value;
      $.ajax({
        type: "PATCH",
        url: `/admin/edit-item-status/${orderID}/${variantID}`,
        data: { status },
        success: function (response) {
          if (response.success) {
            if (response.message) {
              alert(response.message, "success");
            }
            const tableRow = saveButton.closest("tr");
            const cancelButton = tableRow.querySelector(".cancel-order-button");
            if (status === "delivered") {
              cancelButton.style.display = "none";
            } else {
              cancelButton.style.display = "block";
            }
            editStatusButton.style.display = "block";
            saveButton.style.display = "none";
            statusInput.style.display = "none";
            statusData.style.display = "block";
            statusData.innerText = status;
            if (status === "delivered" || status === "cancelled") {
              //remove cancel button
            } else {
              //add cancel button
            }
          } else {
            if (response.message) {
              alert(response.message, "error");
            }
            if (response.redirectUrl) {
              window.location.href = response.redirectUrl;
            }
          }
        },
      });
    });
  });
});

const editStatusButtons = document.querySelectorAll(".edit-status-button");

editStatusButtons.forEach((button) => {});

const cancelOneItemButtons = document.querySelectorAll(".cancel-one-item");
cancelOneItemButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const orderID = button.dataset.orderid;
    const variantID = button.dataset.variantid;
    if (
      await yes({
        message: "Are you sure you want to cancel this item?",
        yesButtonColour: "red",
      })
    ) {
      $.ajax({
        url: `/admin/cancel-item/${orderID}/${variantID}`,
        type: "DELETE",
        success: function (response) {
          if (response.success) {
            alert(response.message, "success", () => {
              window.location.reload();
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
