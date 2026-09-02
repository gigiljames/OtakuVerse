const Order = require("../../models/orderModel");
const ReturnRequest = require("../../models/returnRequestModel");
const Wallet = require("../../models/walletModel");
const ProductVariant = require("../../models/productVariantModel");
const mongoose = require("mongoose");

const getPage = async (req, res) => {
  try {
    const { page } = req.query;
    const requests = await ReturnRequest.find();
    return res.render("admin/returnRequest/request-list", { requests });
  } catch (error) {
    console.log(error);
    console.log("ERROR: Return Request Page");
  }
};

const getRequestData = async (req, res) => {
  try {
    const { requestID } = req.params;
    const request = await ReturnRequest.findById(requestID);
    const order = await Order.findOne({
      _id: request.order_id,
    }).populate("customer_id");
    const orderItems = order.order_items.find(
      (item) => item.variant_id.toString() === request.variant_id.toString()
    );
    order.order_items = orderItems;
    return res.json({ success: true, order, request });
  } catch (error) {
    console.log(error);
    console.log("ERROR: Get Request Data");
  }
};

const editRequestStatus = async (req, res) => {
  try {
    const { requestID } = req.params;
    const { status } = req.body;
    const request = await ReturnRequest.findById(requestID);
    // console.log(requestID, status);
    if (status === "pending") {
      //approved
      //update status
      await ReturnRequest.updateOne(
        { _id: requestID },
        { $set: { return_status: "pending" } }
      );
      //update status in order collection
      await Order.updateOne(
        { _id: request.order_id, "order_items.variant_id": request.variant_id },
        { $set: { "order_items.$.product_status": "return approved" } }
      );
      return res.json({
        success: true,
        message: "Return approved successfully.",
      });
    } else if (status === "rejected") {
      //update status
      await ReturnRequest.updateOne(
        { _id: requestID },
        { $set: { return_status: "rejected" } }
      );
      //update status in order collection
      await Order.updateOne(
        { _id: request.order_id, "order_items.variant_id": request.variant_id },
        { $set: { "order_items.$.product_status": "return rejected" } }
      );
      return res.json({
        success: true,
        message: "Return rejected successfully.",
      });
    } else if (status === "returned") {
      //update status
      await ReturnRequest.updateOne(
        { _id: requestID },
        { $set: { return_status: "returned" } }
      );
      //update status in order collection
      await Order.updateOne(
        { _id: request.order_id, "order_items.variant_id": request.variant_id },
        { $set: { "order_items.$.product_status": "returned" } }
      );
      return res.json({
        success: true,
        message: "Product marked as returned successfully.",
      });
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR: Edit Request Status");
  }
};

const returnRefund = async (req, res) => {
  try {
    const { requestID } = req.params;
    const request = await ReturnRequest.findById(requestID);
    const orderID = request.order_id;
    const variantID = request.variant_id;
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
    //checking if already refunded
    if (item.product_status === "refunded") {
      return res.json({
        success: false,
        message: "Product is refunded already.",
      });
    }
    //update product status
    await Order.updateOne(
      {
        _id: orderID,
        "order_items.variant_id": variantID,
      },
      { $set: { "order_items.$.product_status": "refunded" } }
    );
    //update return request collection
    await ReturnRequest.updateOne(
      { _id: requestID },
      { $set: { is_refunded: true } }
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
      message: "Refund on returned item",
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
    return res.json({
      success: true,
      message: "Item has been refunded successfully.",
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR: Return Refund");
  }
};

module.exports = {
  getPage,
  getRequestData,
  editRequestStatus,
  returnRefund,
};
