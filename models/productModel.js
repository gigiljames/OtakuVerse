const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_desc: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "category",
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    isEnabled: {
      type: Boolean,
      required: true,
      default: true,
    },
    productVariants: [
      {
        type: Schema.Types.ObjectId,
        ref: "productVariants",
      },
    ],
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "productReviews",
      },
    ],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
