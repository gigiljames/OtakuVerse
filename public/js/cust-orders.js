const orderCards = document.querySelectorAll(".order-card");

//DOM is Being Re-rendered: If you dynamically update the DOM without removing previously attached listeners, the event listener will be duplicated.

document.addEventListener("DOMContentLoaded", () => {
  orderCards.forEach((orderCard) => {
    const returnItemButtons = orderCard.querySelectorAll(".return-one-item");
    returnItemButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const orderID = button.dataset.orderid;
        const variantID = button.dataset.variantid;
        handleReturn(orderID, variantID);
      });
    });
    const button = orderCard.querySelector(".cancel-button");
    if (!button) {
      return;
    }
    button.addEventListener("click", async () => {
      if (
        await yes({
          message: "Are you sure you want to cancel this order?",
          yesButtonColour: "red",
        })
      ) {
        const orderID = button.dataset.id;
        const status = orderCard.querySelector(".status");
        const orderFunctions = orderCard.querySelector(".order-functions");
        const deliveryDate = orderCard.querySelector(".delivery-date");
        $.ajax({
          type: "DELETE",
          url: `/cancel-order/${orderID}`,
          success: function (response) {
            if (response.success) {
              if (response.message) {
                alert(response.message, "success", () => {
                  window.location.reload();
                });
              }
              // status.innerText = "Cancelled";
              // status.style.color = "red";
              // deliveryDate.remove();
              // orderFunctions.remove();
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
      }
    });
    const cancelOneItemButtons = document.querySelectorAll(".cancel-one-item");
    cancelOneItemButtons.forEach((button) => {
      if (!button.dataset.listenerAdded) {
        button.dataset.listenerAdded = true;
        button.addEventListener("click", async (event) => {
          if (
            await yes({
              message: "Are you sure you want to cancel this item?",
              yesButtonColour: "red",
            })
          ) {
            const orderID = button.dataset.orderid;
            const variantID = button.dataset.variantid;
            const orderCard = button.closest(".order-card");
            // console.log(variantID);
            $.ajax({
              url: `/cancel-item/${orderID}/${variantID}`,
              type: "DELETE",
              success: function (response) {
                if (response.success) {
                  alert(response.message, "success", () => {
                    window.location.reload();
                    // const itemCard = orderCard.querySelector(
                    //   `.item-${variantID}`
                    // );
                    // itemCard.remove();
                    // const itemCards = orderCard.querySelectorAll(".item-card");
                    // if (itemCards.length === 1) {
                    //   const cancelButton =
                    //     itemCards[0].querySelector(".cancel-one-item");
                    //   cancelButton.remove();
                    // }
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
      }
    });
  });
});

function handleReturn(orderID, variantID) {
  const addForm = document.getElementById("add-form");
  const addFormOuter = document.getElementsByClassName("add-form-outer")[0];
  addFormOuter.style.display = "flex";
  const closeButton = document.getElementsByClassName("close-button")[0];
  closeButton.addEventListener("click", (event) => {
    addFormOuter.style.display = "none";
  });
  addForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addFormOuter.style.display = "none";
    const reason = addForm.querySelector("#reason").value;
    $.ajax({
      url: `/return-request/${orderID}/${variantID}`,
      type: "POST",
      data: { reason },
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

const retryButtons = document.querySelectorAll(".retry-payment-button");
retryButtons.forEach((button) => {
  const orderID = button.dataset.id;
  button.addEventListener("click", () => {
    $.ajax({
      url: `/retry-payment/${orderID}`,
      type: "POST",
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
            alert("Payment failed.", "error", () => {
              $.ajax({
                url: `/edit-payment-status/${DBOrderID}?status=failed`,
                type: "PATCH",
                success: function (response) {
                  if (response.success && response.redirectUrl) {
                    window.location.href = "/orders";
                  }
                },
              });
            });
          });
          razorpayObject.open();
        } else {
          alert(response.message, "error");
        }
      },
    });
  });
});

const invoiceButtons = document.querySelectorAll(".invoice-button");
invoiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const orderID = button.dataset.id;
    $.ajax({
      type: "GET",
      url: `/get-invoice/${orderID}`,
      success: function (response) {
        if (response.success) {
          downloadPDF(response.data);
        } else {
          alert(response.message, "error");
        }
      },
      error: function (error) {},
    });
  });
});

const downloadPDF = (data) => {
  createInvoiceElement(data);
  const reportElement = document.querySelector(".invoice");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  pdf.html(reportElement, {
    callback: function (doc) {
      doc.save("invoice.pdf");
    },
    x: 10,
    y: 10,
    width: 190,
    windowWidth: document.body.scrollWidth,
  });
};

function createInvoiceElement(data) {
  let productRows = "";
  data.order_items.forEach((product) => {
    productRows += `<tr>
          <td>${product.product_name} ${product.size} ${product.colour}</td>
          <td>${product.quantity}</td>
          <td>${product.og_price}</td>
          <td>${product.discount}%</td>
          <td>${product.price}</td>
          <td>${product.total_price}</td>
        </tr>`;
  });
  let invoiceHtml = `<div class="invoice"><div class="invoice-container">
  <div class="logo">OtakuVerse</div>
  <div class="general-info">
    <div class="address-info">
      <div class="subtitle bold">SHIPPING ADDRESS</div>
      <div class="line1">${data.address.recipient_name}</div>
      <div class="line2">${data.address.apartment}</div>
      <div class="line3">${data.address.street}</div>
      <div class="line4">${data.address.city}, ${data.address.state}</div>
      <div class="line5">PIN - ${data.address.pincode}</div>
      <div class="line6">Mobile no. - ${data.address.phone_number}</div>
    </div>
    <div class="order-info">
      <div class="order-id flex-item">
        Order ID: <span>${data.order_id}</span>
      </div>
      <div class="billing-date flex-item">
        Billing date: <span>${data.billing_date}</span>
      </div>
      <div class="payment-method flex-item">
        Payment method: <span>${data.payment_type}</span>
      </div>
      <div class="payment-status flex-item">
        Payment status: <span>${data.payment_status}</span>
      </div>
      <div class="delivery-date flex-item">
        Delivery date: <span>${data.delivery_date}</span>
      </div>
    </div>
  </div>
  <hr />
  <div class="products-info">
    <table>
      <thead>
        <th>Product</th>
        <th>Quantity</th>
        <th>Price</th>
        <th>Discount</th>
        <th>Discounted price</th>
        <th>Total Price</th>
      </thead>
      <tbody>
        ${productRows}
      </tbody>
    </table>
    <hr />
    <div class="final-calculations-container">
      <div class="final-calculations">
        <div class="subtotal bold flex-item">
          SUBTOTAL: <span>${data.subtotal_amount}</span>
        </div>
        <div class="delivery-charges flex-item">
          Delivery charges: <span>${data.delivery_charge}</span>
        </div>
        <div class="total bold flex-item">
          TOTAL: <span>${
            Number(data.subtotal_amount) + Number(data.delivery_charge)
          }</span>
        </div>
        <div class="discount flex-item">
          Discount: <span>${data.total_discount}</span>
        </div>
        <div class="free-delivery flex-item">
          Free delivery: <span>-${data.delivery_charge}</span>
        </div>
        
        <div class="coupon flex-item">
          Coupon discount: <span>${data.coupon_discount}</span>
        </div>
        <div class="grand-total bold flex-item">
          GRAND TOTAL: <span>${data.amount}</span>
        </div>
      </div>
    </div>
    <hr />
  </div>
  <div class="promotion">
    You saved ${data.saved_amount} (${data.saved_percentage}%) on this purachase
    
  </div>
  <div class="logo">Otakuverse</div>
</div>
<style>
  .invoice-container .general-info {
    display: flex;
    justify-content: space-between;
  }
  .invoice-container .bold {
    font-weight: 700;
    font-size: 20px;
  }
  .invoice-container .final-calculations-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  .invoice-container .final-calculations {
    display: flex;
    flex-direction: column;
    /* align-items: flex-start; */
    gap: 5px;
  }
  .invoice-container .flex-item {
    display: flex;
    justify-content: space-between;
  }
  .invoice-container hr {
    margin: 15px 0px;
  }
  .invoice-container {
    padding: 60px;
  }
  .invoice-container .logo {
    font-family: "Micro 5", sans-serif;
    font-size: 30px;
    background-image: linear-gradient(black, black);
    color: white;
    -webkit-text-stroke-width: 5px;
    -webkit-text-stroke-color: transparent;
    background-clip: text;
    font-weight: 700;
    margin-bottom: 20px;
    /* padding-left: 5px; */
  }
  .invoice-container .promotion{
    text-align:center;
    margin: 20px 0px;
    font-size: 20px;
    font-weight: 600;
  }
  .invoice-container table {
    border-collapse: collapse;
    width: 100%;
  }
  .invoice-container td,
  .invoice-container th {
    border: 1px solid black;
    text-align: center;   
    padding: 10px;
  }
  .invoice-container th {
    background-color: black;
    color: white;
    padding: 7px;
  }
</style>
</div>
`;
  let element = document.querySelector(".hidden-invoice");
  element.innerHTML = invoiceHtml;
}
