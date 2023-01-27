const mongoose = require("mongoose");
require("dotenv").config();

mongoose.set("strictQuery", true);

mongoose.connect(process.env.dbConnection, () => {
  console.log("db is connected");
});
