const Order = require("../../models/orderModel");
const Customer = require("../../models/customerModel");
const PDFDocument = require("pdfkit");
const fs = require("fs");

const getPage = async (req, res) => {
  try {
    if (req.session.admin) {
      res.render("admin/home/admin-home");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Admin Home");
  }
};

function getOptions(period) {
  let groupOptions = null;
  let sortOptions = { "_id.year": 1 };
  switch (period) {
    case "yearly":
      groupOptions = {
        year: { $year: "$createdAt" },
      };
      sortOptions = { "_id.year": 1 };
      break;
    case "monthly":
      groupOptions = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
      sortOptions = { "_id.year": 1, "_id.month": 1 };
      break;
    case "weekly":
      groupOptions = {
        year: { $year: "$createdAt" },
        week: { $week: "$createdAt" }, // Extract the week number
      };
      sortOptions = { "_id.year": 1, "_id.week": 1 };
      break;
    case "daily":
      groupOptions = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };
      sortOptions = { "_id.year": 1, "_id.month": 1, "_id.day": 1 };
      break;
    default:
      groupOptions = null;
      sortOptions = { "_id.year": 1 };
      break;
  }
  return { groupOptions, sortOptions };
}

const getCustomRangeData = async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const { groupOptions, sortOptions } = getOptions("daily");
    const amountQuery = await Order.aggregate([
      {
        $match: {
          order_status: { $ne: "cancelled" },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: groupOptions,
          total_amount: { $sum: "$amount" },
        },
      },
      { $sort: sortOptions },
    ]);
    const salesQuery = await Order.aggregate([
      {
        $match: {
          order_status: { $ne: "cancelled" },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$order_items" },
      {
        $group: {
          _id: groupOptions,
          total_sales: { $sum: "$order_items.quantity" },
        },
      },
      { $sort: sortOptions },
    ]);
    const discountQuery = await Order.aggregate([
      {
        $match: {
          order_status: { $ne: "cancelled" },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$order_items" },
      {
        $group: {
          _id: groupOptions,
          total_discount: {
            $sum: {
              $multiply: [
                "$order_items.discount",
                "$order_items.quantity",
                "$order_items.price",
                0.01,
              ],
            },
          },
        },
      },
      { $sort: sortOptions },
    ]);
    const newUsers = await Customer.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: groupOptions,
          total_new_users: { $sum: 1 },
        },
      },
    ]);

    const combinedData = [
      ...amountQuery,
      ...discountQuery,
      ...salesQuery,
      ...newUsers,
    ];
    let processedData = {};
    combinedData.forEach((value) => {
      let key = "overall";
      if (value._id) {
        key = getKey(value._id);
      }

      if (!processedData[key]) {
        processedData[key] = {
          total_sales: 0,
          total_amount: 0,
          total_discount: 0,
          total_new_users: 0,
        };
      }
      if (value.total_amount) {
        processedData[key].total_amount = value.total_amount;
      }
      if (value.total_discount) {
        processedData[key].total_discount = value.total_discount;
      }
      if (value.total_sales) {
        processedData[key].total_sales = value.total_sales;
      }
      if (value.total_new_users) {
        processedData[key].total_new_users = value.total_new_users;
      }
    });
    // console.log(processedData);
    const result = Object.entries(processedData).map(([date, stats]) => ({
      date,
      ...stats,
    }));
    result.sort((b, a) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });

    console.log(result);
    return res.json({ success: true, salesData: result });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Get Custom Range");
  }
};

const getSalesData = async (req, res) => {
  try {
    const { period } = req.query;
    const { groupOptions, sortOptions } = getOptions(period);
    const amountQuery = await Order.aggregate([
      { $match: { order_status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: groupOptions,
          total_amount: { $sum: "$amount" },
        },
      },
      { $sort: sortOptions },
    ]);
    const salesQuery = await Order.aggregate([
      { $match: { order_status: { $ne: "cancelled" } } },
      { $unwind: "$order_items" },
      {
        $group: {
          _id: groupOptions,
          total_sales: { $sum: "$order_items.quantity" },
        },
      },
      { $sort: sortOptions },
    ]);
    const discountQuery = await Order.aggregate([
      { $match: { order_status: { $ne: "cancelled" } } },
      { $unwind: "$order_items" },
      {
        $group: {
          _id: groupOptions,
          total_discount: {
            $sum: {
              $multiply: [
                "$order_items.discount",
                "$order_items.quantity",
                "$order_items.price",
                0.01,
              ],
            },
          },
        },
      },
      { $sort: sortOptions },
    ]);
    const newUsers = await Customer.aggregate([
      {
        $group: {
          _id: groupOptions,
          total_new_users: { $sum: 1 },
        },
      },
    ]);

    const combinedData = [
      ...amountQuery,
      ...discountQuery,
      ...salesQuery,
      ...newUsers,
    ];
    let processedData = {};
    combinedData.forEach((value) => {
      let key = "overall";
      if (value._id) {
        key = getKey(value._id);
      }

      if (!processedData[key]) {
        processedData[key] = {
          total_sales: 0,
          total_amount: 0,
          total_discount: 0,
          total_new_users: 0,
        };
      }
      if (value.total_amount) {
        processedData[key].total_amount = value.total_amount;
      }
      if (value.total_discount) {
        processedData[key].total_discount = value.total_discount;
      }
      if (value.total_sales) {
        processedData[key].total_sales = value.total_sales;
      }
      if (value.total_new_users) {
        processedData[key].total_new_users = value.total_new_users;
      }
    });
    // console.log(processedData);
    const result = Object.entries(processedData).map(([date, stats]) => ({
      date,
      ...stats,
    }));
    if (period === "weekly") {
      result.sort((b, a) => {
        const [yearA, weekA] = a.date.match(/\d+/g).map(Number);
        const [yearB, weekB] = b.date.match(/\d+/g).map(Number);
        return yearA - yearB || weekA - weekB;
      });
    } else {
      result.sort((b, a) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });
    }

    console.log(result);
    return res.json({ success: true, salesData: result });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Get Sales Data");
  }
};

const downloadReport = async (req, res) => {
  const salesReport = [
    // Replace with your actual sales report data
    {
      date: "2024-12-01",
      total_sales: 50,
      total_amount: 5000,
      total_discount: 500,
      total_new_users: 10,
    },
    {
      date: "2024-12-02",
      total_sales: 60,
      total_amount: 6000,
      total_discount: 600,
      total_new_users: 15,
    },
    // Add more entries
  ];

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=sales-report.pdf");

  doc.pipe(res);

  doc.fontSize(18).text("Sales Report", { align: "center" }).moveDown(1);
  doc
    .fontSize(12)
    .text("Generated on: " + new Date().toLocaleDateString(), {
      align: "right",
    })
    .moveDown(2);
  doc
    .fontSize(14)
    .text("Date", 50, doc.y)
    .text("Sales", 150)
    .text("Amount", 250)
    .text("Discount", 350)
    .text("New Users", 450);
  doc.moveDown();
  salesReport.forEach(
    ({ date, total_sales, total_amount, total_discount, total_new_users }) => {
      doc
        .text(date, 50, doc.y)
        .text(total_sales, 150)
        .text(total_amount, 250)
        .text(total_discount, 350)
        .text(total_new_users, 450);
      doc.moveDown();
    }
  );
  doc.end();
};

function getKey(obj) {
  let keyString = [];
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
  if (obj.year) {
    keyString.push(obj.year);
  }
  if (obj.month) {
    keyString.push(months[obj.month - 1]);
  }
  if (obj.week) {
    keyString.push("Week " + obj.week);
  }
  if (obj.day) {
    keyString.push(obj.day);
  }
  return keyString.join(" ");
}

module.exports = {
  getPage,
  getSalesData,
  getCustomRangeData,
  downloadReport,
};
