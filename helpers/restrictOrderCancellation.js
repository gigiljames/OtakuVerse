const Order = require("../models/orderModel");

async function restrictOrderCancellation(orderID) {
  //if all individuals items are cancelled set is_cancellable = true
  let cancellable = false;
  let removeDeliveryDate = 1;
  let orderItems = await Order.findById(orderID);
  for (let item of orderItems.order_items) {
    let status = item.product_status;
    if (
      status === "processing" ||
      status === "shipping" ||
      status === "out for delivery"
    ) {
      cancellable = true;
    }
    if (status === "cancelled") {
      removeDeliveryDate *= 1;
    } else {
      removeDeliveryDate *= 0;
    }
  }
  await Order.updateOne(
    { _id: orderID },
    { $set: { is_cancellable: cancellable } }
  );
  if (removeDeliveryDate === 1) {
    await Order.updateOne({ _id: orderID }, { $set: { delivery_date: null } });
  }
}

module.exports = restrictOrderCancellation;
