const express = require("express");
const StudentRouter = require("./StudentRouter");
const marksRouter = require("./marks");

const mainRouter = express();

mainRouter.use("/student", StudentRouter);
mainRouter.use("/marks", marksRouter);

module.exports = mainRouter;
