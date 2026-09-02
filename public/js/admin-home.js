document.addEventListener("DOMContentLoaded", (event) => {
  getSalesData();
  refreshTopTenProducts();
  refreshTopTenCategories();
  const periodInput = document.getElementById("report-period");
  const custRangeInputs = document.querySelector(".custom-range-inputs");
  const salesReport = document.querySelector("#salesReport");
  const goButton = document.getElementById("go-button");
  periodInput.addEventListener("change", () => {
    if (periodInput.value === "range") {
      custRangeInputs.style.display = "flex";
    } else {
      custRangeInputs.style.display = "none";
    }
  });
  goButton.addEventListener("click", () => {
    salesReport.style.display = "flex";
    const period = periodInput.value;
    if (period === "range") {
      const start = custRangeInputs.querySelector("#start").value;
      const end = custRangeInputs.querySelector("#end").value;
      const startDate = new Date(start);
      const endDate = new Date(end);
      const currDate = new Date();
      let flag = 1;
      if (startDate > endDate || startDate > currDate || endDate > currDate) {
        flag = 0;
        alert("Enter a valid date range", "error");
      }
      if (flag === 1) {
        getCustomRangeData(start, end);
      }
    } else {
      getSalesData(period);
    }
    setTimeout(() => {
      window.scrollTo({
        top: 300,
        left: 0,
        behavior: "smooth",
      });
    }, 200);
  });
  document.getElementById("downloadPDF").addEventListener("click", downloadPDF);
});

function refreshTopTenProducts() {
  const topProductsList = document.querySelector(".top-products-list");
  topProductsList.innerHTML = "";
  $.ajax({
    url: "/admin/top-products",
    type: "GET",
    success: function (response) {
      if (response.list) {
        response.list.forEach((product) => {
          const item = document.createElement("li");
          item.innerHTML = `<a href="/admin/view-product/${product._id}">${product.product_name}</a>`;
          topProductsList.appendChild(item);
        });
      }
    },
    error: function (error) {},
  });
}

function refreshTopTenCategories() {
  const topCategoriesList = document.querySelector(".top-categories-list");
  topCategoriesList.innerHTML = "";
  $.ajax({
    url: "/admin/top-categories",
    type: "GET",
    success: function (response) {
      if (response.list) {
        response.list.forEach((cat) => {
          const item = document.createElement("li");
          item.innerHTML = `<a href="/admin/category/${cat.category_id}">${cat.category_name}</a>`;
          topCategoriesList.appendChild(item);
        });
      }
    },
    error: function (error) {},
  });
}

const downloadPDF = () => {
  const reportElement = document.getElementById("salesReport");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  pdf.html(reportElement, {
    callback: function (doc) {
      // const imgData = document
      //   .getElementById("salesChart")
      //   .toDataURL("image/png");
      // pdf.addImage(imgData, "PNG", 10, 10, 90, 50);
      doc.save("sales_report.pdf");
    },
    x: 10,
    y: 10,
    width: 190,
    windowWidth: document.body.scrollWidth,
  });
};

const downloadExcel = (salesReportData) => {
  // Convert the data to a worksheet
  const ws = XLSX.utils.json_to_sheet(salesReportData);
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
  // Download the Excel file
  XLSX.writeFile(wb, "sales_report.xlsx");
};

let salesDataGlobal;
document.getElementById("downloadExcel").addEventListener("click", () => {
  downloadExcel(salesDataGlobal);
});

function getCustomRangeData(start, end) {
  $.ajax({
    type: "GET",
    url: `/admin/get-custom-range-data?start=${start}&end=${end}`,
    success: function (response) {
      if (response.success) {
        const salesData = response.salesData;
        salesDataGlobal = salesData;
        updateReport(salesData, start + " to " + end);
        updateCharts(salesData);
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

function getSalesData(period = "overall") {
  $.ajax({
    type: "GET",
    url: `/admin/get-sales-data?period=${period}`,
    success: function (response) {
      if (response.success) {
        const salesData = response.salesData;
        if (period === "overall") {
          updateCards(salesData);
        } else {
          updateReport(salesData, period);
          updateCharts(salesData);
        }
        salesDataGlobal = salesData;
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

let salesChart;
let amountChart;
let discountChart;
let couponChart;

function updateCharts(salesData) {
  const labels = salesData.map((value) => value.date);
  const salesCanvas = document.getElementById("salesChart");
  // const ctx = salesCanvas.getContext("2d");

  // // Explicitly set the canvas background color
  // ctx.save(); // Save the current canvas state
  // ctx.fillStyle = "white"; // Set the desired background color
  // ctx.fillRect(0, 0, salesCanvas.width, salesCanvas.height); // Fill the entire canvas with the background color
  // ctx.restore();
  const amountCanvas = document.getElementById("amountChart");
  const discountCanvas = document.getElementById("discountChart");
  const couponCanvas = document.getElementById("couponChart");
  if (salesChart) {
    salesChart.destroy();
  }
  salesChart = new Chart(salesCanvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Total sales",
          data: salesData.map((value) => value.total_sales),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
  if (amountChart) {
    amountChart.destroy();
  }
  amountChart = new Chart(amountCanvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Total amount",
          data: salesData.map((value) => value.total_amount),
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
  if (discountChart) {
    discountChart.destroy();
  }
  discountChart = new Chart(discountCanvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Total discount",
          data: salesData.map((value) => value.total_discount),
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
  if (couponChart) {
    couponChart.destroy();
  }
  couponChart = new Chart(couponCanvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Total coupon discount",
          data: salesData.map((value) => value.total_coupon_discount),
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function updateReport(salesData, period = "Overall") {
  const reportSubtitle = document.querySelector(".report-subtitle");
  reportSubtitle.innerText = `Time period: ${period}`;
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";
  if (salesData.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td colspan="6">No activity during this period.</td>`;
    tbody.appendChild(row);
  }
  for (value of salesData) {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${value.date}</td>
          <td>${value.total_sales}</td>
          <td>${value.total_amount}</td>
          <td>${value.total_discount}</td>
          <td>${value.total_coupon_discount}</td>
          <td>${value.total_new_users}</td>`;

    tbody.appendChild(row);
  }
}

function updateCards(salesData) {
  const amountCardValue = document.querySelector(".amount-container .amount");
  const salesCardValue = document.querySelector(".sales-container .sales");
  const discountCardValue = document.querySelector(
    ".discount-container .discount"
  );
  const newUsersCardValue = document.querySelector(
    ".new-users-container .new-users"
  );
  const couponDiscountValue = document.querySelector(
    ".coupon-discount-container .coupon-discount"
  );
  amountCardValue.innerText = "₹ " + salesData[0].total_amount;
  salesCardValue.innerText = salesData[0].total_sales;
  discountCardValue.innerText = "₹ " + salesData[0].total_discount;
  newUsersCardValue.innerText = salesData[0].total_new_users;
  couponDiscountValue.innerText = "₹ " + salesData[0].total_coupon_discount;
}
