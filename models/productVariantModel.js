const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productVariantsSchema = new Schema(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    colour: {
      type: String,
    },
    size: {
      type: String,
    },
    stock_quantity: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

const ProductVariant = mongoose.model("ProductVariant", productVariantsSchema);
module.exports = ProductVariant;
