const Order = require("../../models/orderModel");

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

const getOverallSales = async (req, res) => {
  try {
    const overallSalesQuery = await Order.aggregate([
      { $match: { order_status: { $ne: "cancelled" } } },
      { $unwind: "$order_items" },
      { $group: { _id: null, total_sales: { $sum: "$order_items.quantity" } } },
    ]);
    let overallSales = overallSalesQuery[0]?.total_sales || 0;
    return res.json({ success: true, overallSales });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Get Overall Sales");
  }
};

const getOverallAmount = async (req, res) => {
  try {
    const overallAmountQuery = await Order.aggregate([
      { $match: { order_status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: null,
          total_sales: { $sum: "$amount" }, // Calculate total sales amount
        },
      },
    ]);
    const overallAmount = overallAmountQuery[0]?.total_sales || "No sales yet";
    // console.log(over);
    return res.json({ success: true, overallAmount });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Get Overall Amount");
  }
};

const getOverallDiscount = async (req, res) => {
  try {
    const overallDiscountQuery = await Order.aggregate([
      { $match: { order_status: { $ne: "cancelled" } } },
      { $unwind: "$order_items" },
      {
        $group: {
          _id: null,
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
    ]);
    let overallDiscount = overallDiscountQuery[0]?.total_discount || 0;
    return res.json({ success: true, overallDiscount });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Get Overall Discount");
  }
};

module.exports = {
  getPage,
  getOverallSales,
  getOverallAmount,
  getOverallDiscount,
};
