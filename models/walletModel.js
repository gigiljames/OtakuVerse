const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const walletSchema = new Schema(
  {
    customer_id: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    transaction_history: [
      {
        order_id: {
          type: Schema.Types.ObjectId,
          ref: "Order",
        },
        amount: {
          type: Number,
          requried: true,
          min: 1,
        },
        transactionType: {
          type: String,
          enum: ["credit", "debit"],
          required: true,
        },
        time: {
          type: Date,
          required: true,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
