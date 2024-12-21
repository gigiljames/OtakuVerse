document.addEventListener("DOMContentLoaded", (event) => {
  $.ajax({
    type: "GET",
    url: "/admin/get-overall-sales",
    success: function (response) {
      if (response.success) {
        const overallSales = document.querySelector(".overall-sales");
        overallSales.innerText = response.overallSales;
      } else {
        if (response.message) {
          console.log(response.message);
        }
      }
    },
    error: function (error) {},
  });
  $.ajax({
    type: "GET",
    url: "/admin/get-overall-amount",
    success: function (response) {
      if (response.success) {
        const overallAmount = document.querySelector(".overall-amount");
        overallAmount.innerText = response.overallAmount;
      } else {
        if (response.message) {
          console.log(response.message);
        }
      }
    },
    error: function (error) {},
  });
  $.ajax({
    type: "GET",
    url: "/admin/get-overall-discount",
    success: function (response) {
      if (response.success) {
        const overallDiscount = document.querySelector(".overall-discount");
        overallDiscount.innerText = response.overallDiscount;
      } else {
        if (response.message) {
          console.log(response.message);
        }
      }
    },
    error: function (error) {},
  });
});
