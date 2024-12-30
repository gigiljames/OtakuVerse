document.addEventListener("DOMContentLoaded", (event) => {
  getSalesData();

  const periodInput = document.getElementById("report-period");
  const custRangeInputs = document.querySelector(".custom-range-inputs");
  const goButton = document.getElementById("go-button");
  periodInput.addEventListener("change", () => {
    if (periodInput.value === "range") {
      custRangeInputs.style.display = "flex";
    } else {
      custRangeInputs.style.display = "none";
    }
  });
  goButton.addEventListener("click", () => {
    const period = periodInput.value;
    if (period === "range") {
      const start = custRangeInputs.querySelector("#start").value;
      const end = custRangeInputs.querySelector("#end").value;
      getCustomRangeData(start, end);
    } else {
      getSalesData(period);
    }
  });
  document.getElementById("downloadPDF").addEventListener("click", downloadPDF);
});

const downloadPDF = () => {
  const reportElement = document.getElementById("salesReport");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  pdf.html(reportElement, {
    callback: function (doc) {
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

function getCustomRangeData(start, end) {
  $.ajax({
    type: "GET",
    url: `/admin/get-custom-range-data?start=${start}&end=${end}`,
    success: function (response) {
      if (response.success) {
        const salesData = response.salesData;
        updateTable(salesData);
        document
          .getElementById("downloadExcel")
          .addEventListener("click", () => {
            downloadExcel(salesData);
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
          updateTable(salesData);
          document
            .getElementById("downloadExcel")
            .addEventListener("click", () => {
              downloadExcel(salesData);
            });
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
    error: function (error) {},
  });
}

function updateTable(salesData) {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";
  if (salesData.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td colspan="5">No activity during this period.</td>`;
    tbody.appendChild(row);
  }
  for (value of salesData) {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${value.date}</td>
          <td>${value.total_sales}</td>
          <td>${value.total_amount}</td>
          <td>${value.total_discount}</td>
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
  amountCardValue.innerText = salesData[0].total_amount;
  salesCardValue.innerText = salesData[0].total_sales;
  discountCardValue.innerText = salesData[0].total_discount;
  newUsersCardValue.innerText = salesData[0].total_new_users;
}
