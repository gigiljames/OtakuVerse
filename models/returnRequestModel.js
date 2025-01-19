const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const returnRequestSchema = new Schema({
  customer_id: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  order_id: {
    type: Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  variant_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  return_status: {
    type: String,
    enum: ["action required", "pending", "returned", "rejected"],
    required: true,
    default: "action required",
  },
  is_refunded: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const ReturnRequest = mongoose.model("ReturnRequest", returnRequestSchema);
module.exports = ReturnRequest;
