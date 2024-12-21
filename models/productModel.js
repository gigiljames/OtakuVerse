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
    product_specs: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
    },
    discounted_price: { type: Number },
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
    variants: [
      {
        type: Schema.Types.ObjectId,
        ref: "ProductVariant",
      },
    ],
    product_images: [
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
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "ProductReview",
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Pre-save hook to calculate discounted_price
productSchema.pre("save", function (next) {
  if (this.price != null && this.discount != null) {
    this.discounted_price = this.price * (1 - this.discount * 0.01);
    console.log(`Discounted Price Calculated: ${this.discounted_price}`);
  } else {
    console.error(
      "Price or discount is missing. Cannot calculate discounted price."
    );
    this.discounted_price = null;
  }
  next();
});

// Pre-update hook to handle discounted_price for updates
productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.price != null && update.discount != null) {
    update.discounted_price = update.price * (1 - update.discount * 0.01);
    console.log(`Discounted Price Updated: ${update.discounted_price}`);
  }
  next();
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
