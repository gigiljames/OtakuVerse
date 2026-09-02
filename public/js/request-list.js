document.addEventListener("DOMContentLoaded", (event) => {
  const requestRows = document.querySelectorAll("tbody tr");
  requestRows.forEach((row) => {
    const viewButton = row.querySelector(".view-button");
    viewButton.addEventListener("click", (event) => {
      const requestModal = document.querySelector(".request-modal");
      requestModal.style.display = "flex";
      const orderID = viewButton.dataset.orderid;
      const variantID = viewButton.dataset.variantid;
      const requestID = viewButton.dataset.reqid;
      const reason = row.querySelector(".reason-cell").innerText;
      $.ajax({
        url: `/admin/get-request-info/${requestID}`,
        type: "GET",
        success: function (response) {
          updateRequestModal(
            requestModal,
            response.order,
            reason,
            response.request
          );
        },
        error: function (error) {},
      });
    });
  });
});

function updateRequestModal(requestModal, order, reason, request) {
  const requestContainer = document.querySelector(".request-container");
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let orderDate = new Date(order.createdAt);
  let deliveryDate = new Date(order.delivery_date);
  orderDate =
    orderDate.getDate() +
    " " +
    months[orderDate.getMonth()] +
    " " +
    orderDate.getFullYear();
  deliveryDate =
    deliveryDate.getDate() +
    " " +
    months[deliveryDate.getMonth()] +
    " " +
    deliveryDate.getFullYear();
  const paymentMethod = {
    cod: "Cash on delivery",
    razorpay: "Razorpay",
    wallet: "OtakuVerse wallet",
  };
  const item = order.order_items[0];
  let address = order.address;
  let returnStatus = request.return_status;
  let requestFunction = "";
  if (returnStatus === "action required") {
    requestFunction = `<button class="approve-button">Approve</button>
    <button class="reject-button">Reject</button>`;
  } else if (returnStatus === "rejected") {
    requestFunction = `Return rejected`;
  } else if (returnStatus === "pending") {
    requestFunction = `Return approved. Waiting for item to be returned
    <button class="returned-button">Mark as returned</button>`;
  } else if (returnStatus === "returned" && !request.is_refunded) {
    requestFunction = `<button class="refund-button">Initiate refund</button>`;
  } else if (returnStatus === "returned" && !request.is_refunded) {
    requestFunction = `Amount refunded`;
  }
  let html = `<span class="material-symbols-outlined close-button"> close </span>
  <div class="customer-info">
          <div class="info">
            <h3>Customer Details</h3>
            <div class="name">Name: ${order.customer_id.customer_name} </div>
            <div class="email">Email: ${order.customer_id.customer_email}</div>
          </div>
          <div class="return-buttons">
            ${requestFunction}
          </div>
        </div>
        <div class="item-info">
          <h3>Item details</h3>
              <div class="order-card">
                <div class="top-row">
                  <div class="order-date">
                    <div class="top-row-title">Ordered on</div>
                    <div class="top-row-data">${orderDate}</div>
                  </div>
                  <div class="payment-method">
                    <div class="top-row-title">Payment method</div>
                    <div class="top-row-data">${
                      paymentMethod[order.payment_type]
                    }</div>
                  </div>
                  <div class="delivery-date">
                    <div class="top-row-title">Delivered on</div>
                    <div class="top-row-data">${deliveryDate}</div>
                  </div>
                  

                </div>
                
                <div class="bottom-row">
                  <div class="item-container">
                    <img src="${
                      item.product_images[0].filepath
                    }" class="product-image">
                    <div class="item-info">
                      <div class="product-name">
                      ${item.product_name}</div>
                      <div class="variant-container">
                        <div class="variant-size">Size: ${item.size}</div>
                        <div class="variant-colour">Colour: ${item.colour}</div>
                        <div class="quantity">Quantity: ${item.quantity}</div>
                      </div>
                      
                      <div class="product-ov-price">Price: ₹${item.price}</div>
                      
                    </div>
                  </div>
                  <div class="shipping-address">
                  <div class="top-row-title">Shipping address</div>
                    <div class="address-line1">${address.recipient_name}</div>
                    <div class="address-line2">${
                      address.apartment +
                      ", " +
                      address.street +
                      ", " +
                      address.city
                    }</div>
                    <div class="address-line3">${
                      address.state + ", " + address.pincode
                    }</div>
                    <div class="address-line4">Phone number: ${
                      address.phone_number
                    }</div>
                  </div>
                </div>
                <div class="reason-container">
                  <h3>Reason</h3>
                  <div class="reason">${reason}</div>
                </div>
              </div>
        </div>
        `;
  requestContainer.innerHTML = html;
  const closeButton = requestModal.querySelector(".close-button");
  closeButton.addEventListener("click", (event) => {
    requestModal.style.display = "none";
  });
  const approveButton = requestModal.querySelector(".approve-button");
  const rejectButton = requestModal.querySelector(".reject-button");
  const returnedButton = requestModal.querySelector(".returned-button");
  const refundButton = requestModal.querySelector(".refund-button");
  if (approveButton) {
    approveButton.addEventListener("click", (event) => {
      $.ajax({
        url: `/admin/edit-return-status/${request._id}`,
        type: "PATCH",
        data: { status: "pending" },
        success: function (response) {
          if (response.success) {
            alert(
              response.message,
              "success",
              () => {
                window.location.reload();
              },
              2000
            );
          }
        },
        error: function (response) {},
      });
    });
  }
  if (rejectButton) {
    rejectButton.addEventListener("click", (event) => {
      $.ajax({
        url: `/admin/edit-return-status/${request._id}`,
        type: "PATCH",
        data: { status: "rejected" },
        success: function (response) {
          if (response.success) {
            alert(
              response.message,
              "success",
              () => {
                window.location.reload();
              },
              2000
            );
          }
        },
        error: function (response) {},
      });
    });
  }
  if (returnedButton) {
    returnedButton.addEventListener("click", (event) => {
      $.ajax({
        url: `/admin/edit-return-status/${request._id}`,
        type: "PATCH",
        data: { status: "returned" },
        success: function (response) {
          if (response.success) {
            alert(
              response.message,
              "success",
              () => {
                window.location.reload();
              },
              2000
            );
          }
        },
        error: function (response) {},
      });
    });
  }
  if (refundButton) {
    refundButton.addEventListener("click", (event) => {
      $.ajax({
        url: `/admin/return-refund/${request._id}`,
        type: "POST",
        success: function (response) {
          if (response.success) {
            alert(
              response.message,
              "success",
              () => {
                window.location.reload();
              },
              2000
            );
          }
        },
        error: function (response) {},
      });
    });
  }
}

/* <div class="product-status">
  <div class="top-row-title">Status</div>
  <div class="top-row-data">${item.product_status}</div>
</div>; */
