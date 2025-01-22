const Order = require("../../models/orderModel");
const Customer = require("../../models/customerModel");

const getPage = async (req, res) => {
  try {
    if (req.session.admin) {
      return res.render("admin/home/admin-home");
    } else {
      return res.redirect("/admin");
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
    const couponQuery = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $addFields: {
          couponValue: {
            $cond: {
              if: { $not: ["$coupon_applied.is_percentage"] },
              then: "$coupon_applied.value",
              else: {
                $divide: [
                  { $multiply: ["$amount", "$coupon_applied.value"] },
                  100,
                ], // Calculate percentage of amount
              },
            },
          },
        },
      },
      {
        $group: {
          _id: groupOptions,
          total_coupon_discount: { $sum: "$couponValue" },
        },
      },
    ]);

    const combinedData = [
      ...amountQuery,
      ...discountQuery,
      ...salesQuery,
      ...newUsers,
      ...couponQuery,
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
          total_coupon_discount: 0,
        };
      }
      if (value.total_amount) {
        processedData[key].total_amount = value.total_amount.toFixed(2);
      }
      if (value.total_discount) {
        processedData[key].total_discount = value.total_discount.toFixed(2);
      }
      if (value.total_sales) {
        processedData[key].total_sales = value.total_sales.toFixed(2);
      }
      if (value.total_new_users) {
        processedData[key].total_new_users = value.total_new_users.toFixed(2);
      }
      if (value.total_coupon_discount) {
        processedData[key].total_coupon_discount =
          value.total_coupon_discount.toFixed(2);
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
    const couponQuery = await Order.aggregate([
      {
        $addFields: {
          couponValue: {
            $cond: {
              if: { $not: ["$coupon_applied.is_percentage"] },
              then: "$coupon_applied.value", // Add percentage value directly
              else: {
                $divide: [
                  { $multiply: ["$amount", "$coupon_applied.value"] },
                  100,
                ], // Calculate percentage of amount
              },
            },
          },
        },
      },
      {
        $group: {
          _id: groupOptions,
          total_coupon_discount: { $sum: "$couponValue" },
        },
      },
      { $sort: sortOptions },
    ]);
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
      ...couponQuery,
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
          total_coupon_discount: 0,
        };
      }
      if (value.total_amount) {
        processedData[key].total_amount = value.total_amount.toFixed(2);
      }
      if (value.total_discount) {
        processedData[key].total_discount = value.total_discount.toFixed(2);
      }
      if (value.total_sales) {
        processedData[key].total_sales = value.total_sales;
      }
      if (value.total_new_users) {
        processedData[key].total_new_users = value.total_new_users;
      }
      if (value.total_coupon_discount) {
        processedData[key].total_coupon_discount =
          value.total_coupon_discount.toFixed(2);
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

    return res.json({ success: true, salesData: result });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Get Sales Data");
  }
};

const getTopProducts = async (req, res) => {
  try {
    const count = 10;
    const list = await Order.aggregate([
      { $unwind: "$order_items" },
      {
        $group: {
          _id: "$order_items.product_id",
          count: { $sum: 1 },
          product_name: { $first: "$order_items.product_name" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: count },
    ]);
    // console.log(list);
    return res.json({ success: true, list });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Get Top 10 Products");
  }
};

const getTopCategories = async (req, res) => {
  try {
    const count = 10;
    const list = await Order.aggregate([
      { $unwind: "$order_items" },
      {
        $lookup: {
          from: "products",
          localField: "order_items.product_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: count },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $project: {
          _id: 0,
          category_id: "$_id",
          category_name: "$categoryDetails.category_name",
          count: 1,
        },
      },
    ]);
    // console.log(list);
    return res.json({ success: true, list });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Get Top 10 Categories");
  }
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
  getTopProducts,
  getTopCategories,
};
