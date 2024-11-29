const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productReviewsSchema = new Schema(
  {
    customer_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Customer",
    },
    product_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    rating: {
      type: String,
      required: true,
    },
    review_body: {
      type: String,
    },
  },
  { timestamps: true }
);

const ProductReview = mongoose.model("ProductReview", productReviewsSchema);
module.exports = ProductReview;
