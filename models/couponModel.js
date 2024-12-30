const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const couponSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    is_percentage: {
      type: Boolean,
      required: true,
      default: false,
    },
    is_enabled: {
      type: Boolean,
      required: true,
      default: true,
    },
    min_spent: {
      type: Number,
      required: true,
      min: 0,
    },
    uses_per_person: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
