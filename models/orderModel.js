const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    order_status: {
      type: String,
      enum: [
        "processing",
        "shipping",
        "out for delivery",
        "delivered",
        "cancelled",
      ],
      default: "processing",
      required: true,
    },
    customer_id: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    payment_type: {
      type: String,
      enum: ["razorpay", "cod", "wallet"],
      required: true,
    },
    razorpay_order_id: {
      type: String,
    },
    payment_status: {
      type: String,
      enum: ["pending", "failed", "completed"],
      required: true,
      default: "pending",
    },
    // payment_id: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Payment",
    // },
    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    refunded_amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    address: {
      recipient_name: {
        required: true,
        type: String,
      },
      apartment: {
        required: true,
        type: String,
      },
      city: {
        required: true,
        type: String,
      },
      street: {
        required: true,
        type: String,
      },
      state: {
        required: true,
        type: String,
      },
      pincode: {
        required: true,
        type: String,
      },
      phone_number: {
        required: true,
        type: String,
      },
    },
    delivery_date: {
      type: Date,
    },
    order_items: [
      {
        product_id: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        variant_id: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        product_name: {
          type: String,
          required: true,
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
        colour: {
          type: String,
        },
        size: {
          type: String,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        product_status: {
          type: String,
          enum: ["pending", "returned", "cancelled"],
          required: true,
          default: "pending",
        },
      },
    ],
    coupon_applied: {
      code: {
        type: String,
      },
      value: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      },
      is_percentage: {
        type: Boolean,
        required: true,
        default: false,
      },
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
