const Studentmodel = require("../model/StudentSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  newStudent: async (req, res) => {
    try {
      const { StudentName, Email, Password } = req.body;
      const PasswordGenearte = await bcrypt.hash(Password, 10);
      const checkEmail = await Studentmodel.findOne({ Email });
      if (checkEmail) {
        res.json({ err: "Email is alreday exist" });
      } else {
        // await Studentmodel.create({
        //   StudentName,
        //   Email,
        //   Password: PasswordGenearte,
        // });
        res.json({ message: "student is Register, you can login now " });
      }
    } catch (error) {
      res.json({ err: error.message });
    }
  },
  Studentlogin: async (req, res) => {
    try {
      const { Email, Password } = req.body;
      const checkEmail = await Studentmodel.findOne({ Email });
      if (checkEmail) {
        if (await bcrypt.compare(Password, checkEmail.Password)) {
          const token = jwt.sign({ id: checkEmail.id }, "secretKey", {
            expiresIn: "5h",
          });
          res.json({ message: "Student is logined", token });
        } else {
          res.json({ err: "password is wrong" });
        }
      } else {
        res.json({ err: "email is not exit" });
      }
    } catch (error) {
      res.json({ err: error.message });
    }
  },
  getAllData: async (req, res) => {
    const response = await Studentmodel.find();
    res.json({ message: "List of students", response });
    // res.render("studentList", { response, title: "Student List" });
  },
  getAllData1: async (req, res) => {
    const response = await Studentmodel.find();
    res.json({ message: "List of students", response });
    // res.render("studentList", { response, title: "Student List" });
  },
};
