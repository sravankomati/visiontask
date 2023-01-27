const express = require("express");
const StudentController = require("../controller/StudentController");
const { studentvalidate, verifyToken } = require("../middleware/student");

const StudentRouter = express();

StudentRouter.post("/add", studentvalidate, StudentController.newStudent);
StudentRouter.post("/login", StudentController.Studentlogin);
StudentRouter.get("/getalldata", StudentController.getAllData);

module.exports = StudentRouter;
