const express = require("express");
const mainRouter = require("./router/index");
const frontEndRouter = require("./router/frontEnd");
var bodyParser = require('body-parser')
require("./confg/db");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use("/api", mainRouter);
app.use("/", frontEndRouter);

app.listen(4000, () => {
  console.log("server is working");
});
