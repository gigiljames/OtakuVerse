const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    category_name: {
      type: String,
      required: true,
    },
    category_desc: {
      type: String,
      required: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "products",
      },
    ],
    is_enabled: {
      type: Boolean,
      required: true,
      default: true,
    },
    banner_images: {},
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
