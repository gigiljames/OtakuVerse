const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  order_status: {
    type: String,
    enum: ["processing", "shipping", "out for delivery", "delivered"],
    default: "processing",
    required: true,
  },
  customer_id: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  payment_type: {
    type: String,
    enum: ["upi", "cod"],
    required: true,
  },
  payment_id: {
    type: Schema.Types.ObjectId,
    ref: "Payment",
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  address: {
    type: Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  delivery_date: {
    type: Date,
  },
  order_items: [
    {
      product_id: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      variant_id: {
        type: Schema.Types.ObjectId,
        ref: "ProductVariant",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
