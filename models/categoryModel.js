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
    offer: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    is_enabled: {
      type: Boolean,
      required: true,
      default: true,
    },
    is_deleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    banner_images: [
      {
        filename: {
          type: String,
          required: true,
        },
        filepath: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
