const Order = require("../../models/orderModel");
const Wallet = require("../../models/walletModel");
const ProductVariant = require("../../models/productVariantModel");

const getPage = async (req, res) => {
  try {
    const { offset } = req.query;
    const limit = 10;
    const orderCount = await Order.find().countDocuments();
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip(limit * (offset - 1))
      .limit(limit)
      .populate("customer_id", "customer_name");
    return res.render("admin/orderManagement/order-list", {
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
      {
        $set: {
          "order_items.$[].product_status": "cancelled",
          is_cancelled: true,
        },
      }
    );
    //refund
    let amount = 0;
    if (
      (order.payment_type === "razorpay" || order.payment_type === "wallet") &&
      order.payment_status === "completed"
    ) {
      amount = order.amount - order.refunded_amount;
      const transaction = {
        amount: amount,
        transactionType: "credit",
        message: "Refund on cancelled order",
      };
      await Wallet.updateOne(
        { customer_id: order.customer_id },
        {
          $inc: { balance: amount },
          $push: { transaction_history: transaction },
        },
        { upsert: true }
      );
    }
    await Order.updateOne(
      { _id: orderID },
      { $inc: { refunded_amount: amount } }
    );
    return res.json({
      success: true,
      message: "Order has been cancelled successfully.",
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Cancel Order");
  }
};

const cancelItem = async (req, res) => {
  try {
    const { orderID, variantID } = req.params;
    const order = await Order.findOne(
      {
        _id: orderID,
        "order_items.variant_id": variantID,
      },
      {
        "order_items.$": 1,
        coupon_applied: 1,
        amount: 1,
        customer_id: 1,
      }
    );
    const item = order.order_items[0];
    //checking if already cancelled
    if (item.product_status === "cancelled") {
      return res.json({
        success: false,
        message: "Product is cancelled already.",
      });
    }
    //update product status
    await Order.updateOne(
      {
        _id: orderID,
        "order_items.variant_id": variantID,
      },
      { $set: { "order_items.$.product_status": "cancelled" } }
    );
    let price = item.price;
    // handling coupon reduction in refund
    if (order.coupon_applied?.value) {
      if (order.coupon_applied.is_percentage) {
        price =
          Math.round(price * (1 - order.coupon_applied.value / 100) * 100) /
          100;
      } else {
        const actualAmount = order.amount + order.coupon_applied.value;
        let couponPercentage =
          (order.coupon_applied.value * 100) / actualAmount;
        price = Math.round(price * (1 - couponPercentage / 100) * 100) / 100;
      }
    }
    price *= item.quantity;
    //refund
    const transaction = {
      amount: price,
      transactionType: "credit",
      message: "Refund on cancelled item",
    };
    await Wallet.updateOne(
      { customer_id: order.customer_id },
      {
        $inc: { balance: price },
        $push: { transaction_history: transaction },
      },
      { upsert: true }
    );
    await Order.updateOne(
      { _id: orderID },
      { $inc: { refunded_amount: price } }
    );
    //update stock
    await ProductVariant.updateOne(
      { _id: variantID },
      { $inc: { stock_quantity: item.quantity } }
    );
    //if all individuals items are cancelled set is_cancelled = true
    const notCancelled = await Order.aggregate([
      { $match: { _id: orderID } },
      { $unwind: "$order_items" },
      { $match: { "order_items.product_status": { $ne: "cancelled" } } },
      { $limit: 1 },
    ]);
    if (notCancelled.length === 0) {
      await Order.updateOne(
        { _id: orderID },
        {
          $set: {
            is_cancelled: true,
          },
        }
      );
    }
    return res.json({
      success: true,
      message: "Item has been cancelled successfully.",
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Cancel Item");
  }
};

// const editStatus = async (req, res) => {
//   try {
//     const { orderID } = req.params;
//     const { status } = req.body;
//     await Order.updateOne({ _id: orderID }, { $set: { order_status: status } });
//     res.json({ success: true, message: "Order status updated successfully." });
//   } catch (error) {
//     console.log(error);
//     console.log("ERROR : Edit Status");
//   }
// };

const editItemStatus = async (req, res) => {
  try {
    const { orderID, variantID } = req.params;
    const { status } = req.body;
    await Order.updateOne(
      {
        _id: orderID,
        "order_items.variant_id": variantID,
      },
      { $set: { "order_items.$.product_status": status } }
    );
    return res.json({
      success: true,
      message: "Item status updated successfully.",
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Edit Item Status");
  }
};

module.exports = {
  getPage,
  cancelOrder,
  cancelItem,
  editItemStatus,
};
