const mongoose = require("mongoose");

const Studentmodel = new mongoose.Schema({
  StudentName: String,
  Email: String,
  Password: String,
  Class: Number,
  Gender: String,
});

module.exports = new mongoose.model("Student", Studentmodel);
