const mongoose = require("mongoose");
const { Schema } = mongoose;

const wishlistSchema = new Schema({
  customer_id: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: "Customer",
    unique: true,
  },
  wishlist_items: [
    {
      product_id: {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
      variant_id: {
        type: Schema.Types.ObjectId,
        ref: "ProductVariant",
      },
    },
  ],
});

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
module.exports = Wishlist;
