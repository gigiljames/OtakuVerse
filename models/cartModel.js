const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema({
  customer_id: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: "Customer",
  },
  cart_items: [
    {
      product_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Product",
      },
      variant_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "ProductVariant",
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },
      inStock: {
        type: Boolean,
        required: true,
        default: true,
      },
    },
  ],
  coupon_id: {
    type: Schema.Types.ObjectId,
    ref: "Coupon",
    default: null,
  },
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
