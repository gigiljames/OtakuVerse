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
  item_id: {
    type: Schema.Types.ObjectId,
  },
  reason: {
    type: String,
    required: true,
  },
});

const ReturnRequest = mongoose.model("ReturnRequest", returnRequestSchema);
module.exports = ReturnRequest;
