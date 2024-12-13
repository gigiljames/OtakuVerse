const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customerSchema = new Schema(
  {
    customer_name: {
      type: String,
      required: true,
    },
    customer_email: {
      type: String,
      required: true,
      unique: true,
    },
    google_id: {
      type: String,
      unique: true,
    },
    customer_password: {
      type: String,
      required: false,
    },
    account_status: {
      type: String,
      enum: ["active", "banned", "deleted"],
      required: true,
      default: "active",
    },
    customer_addresses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
    cart: {
      type: Schema.Types.ObjectId,
      ref: "Cart",
    },
    wishlist: {
      type: Schema.Types.ObjectId,
      ref: "wishlist",
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "orders",
      },
    ],
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
