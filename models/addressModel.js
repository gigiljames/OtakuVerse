const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  customer_id: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: "Customer",
  },
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
});

const Address = mongoose.model("Address", addressSchema);
module.exports = Address;
