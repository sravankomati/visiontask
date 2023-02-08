const mongoose = require("mongoose");

const paymentModel = new mongoose.Schema({
  username: String,
  payment_id: String,
  amount: String,
  currency: String,
  paymentMethod: String,
});

module.exports = new mongoose.model("Payment", paymentModel);
