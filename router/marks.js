const express = require("express");
const marksController = require("../controller/marksController");
const { verifyToken, marksvalidate } = require("../middleware/student");

const Router = express.Router();

Router.post("/add", [verifyToken, marksvalidate], marksController.addMarks);
Router.get("/getWithHighScore", [verifyToken], marksController.getWithScore);
Router.get(
  "/getWithHighmarks",
  [verifyToken],
  marksController.getWithHighmarks
);
Router.get("/getstudentBtw", [verifyToken], marksController.getstudentBtw);
Router.get("/geMarks", [verifyToken], marksController.geMarks);

module.exports = Router;
