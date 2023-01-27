const mongoose = require("mongoose");

const marksmodel = new mongoose.Schema({
  Total: Number,
  satus: String,
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  Subjects: [],
});

module.exports = new mongoose.model("Marks", marksmodel);
