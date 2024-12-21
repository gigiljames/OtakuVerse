const Order = require("../../models/orderModel");
const ProductVariant = require("../../models/productVariantModel");

const getPage = async (req, res) => {
  try {
    const { offset } = req.query;
    const limit = 10;
    const orderCount = await Order.find().countDocuments();
    const orders = await Order.find()
      .skip(limit * (offset - 1))
      .limit(limit)
      .populate("customer_id", "customer_name");
    res.render("admin/orderManagement/order-list", {
      orders,
      pageCount: Math.ceil(orderCount / limit),
      offset,
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Order Management Get Page");
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderID } = req.params;
    const order = await Order.findById(orderID);
    //re-stock
    order.order_items.forEach(async (item) => {
      await ProductVariant.updateOne(
        { _id: item.variant_id },
        { $inc: { stock_quantity: item.quantity } }
      );
    });
    //cancel order
    await Order.updateOne(
      { _id: orderID },
      { $set: { order_status: "cancelled" } }
    );
    res.json({
      success: true,
      message: "Order has been cancelled successfully.",
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Cancel Order");
  }
};

const editStatus = async (req, res) => {
  try {
    const { orderID } = req.params;
    const { status } = req.body;
    await Order.updateOne({ _id: orderID }, { $set: { order_status: status } });
    res.json({ success: true, message: "Order status updated successfully." });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Edit Status");
  }
};

module.exports = {
  getPage,
  cancelOrder,
  editStatus,
};
