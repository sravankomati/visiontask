const express = require("express");
const mainRouter = require("./router/index");
const frontEndRouter = require("./router/frontEnd");
var bodyParser = require("body-parser");
const cors = require("cors");
// const helmet = require('helmet');
require("./confg/db");

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
// app.use(helmet());
app.use("/api", mainRouter);
app.use("/", frontEndRouter);


app.listen(4000, () => {
  console.log("server is working");
});
