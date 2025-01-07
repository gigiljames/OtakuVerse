const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const couponUsesSchema = new Schema(
  {
    coupon_id: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
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
  },
  { timestamps: true }
);

const CouponUse = mongoose.model("CouponUse", couponUsesSchema);
module.exports = CouponUse;
