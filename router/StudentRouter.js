const express = require("express");
const StudentController = require("../controller/StudentController");
const { studentvalidate, verifyToken } = require("../middleware/student");

const StudentRouter = express();

StudentRouter.post("/add", studentvalidate, StudentController.newStudent);
StudentRouter.post("/login", StudentController.Studentlogin);
StudentRouter.get("/getalldata", verifyToken, StudentController.getAllData);
StudentRouter.get("/getalldata1", StudentController.getAllData1);

module.exports = StudentRouter;
