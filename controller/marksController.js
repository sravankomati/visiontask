const marksSchema = require("../model/marksSchema");

module.exports = {
  addMarks: async (req, res) => {
    try {
      const { Subjects } = req.body;
      var existData = await marksSchema.find({ student_id: req.st_id });
      if (existData) {
        var result = [];
        result = existData[0].Subjects.filter(function (cv) {
          return !Subjects.find(function (e) {
            return e.name == cv.name;
          });
        });
           result.map((res) => {
          Subjects.push(res);
        });
      }
      var Total = Subjects.reduce((prev, curt) => {
        return prev + curt.marks;
      }, 0);
      var Percentage = Number(
        ((Total / (Subjects.length * 100)) * 100).toFixed(2)
      );
      var status = "";
      if (Percentage > 75) {
        status = "Distinction";
      } else if (Percentage <= 35) {
        status = "Fail";
      } else {
        status = "Pass";
      }
      if (existData) {
        await marksSchema.findByIdAndUpdate(existData[0].id, {
          Subjects,
          Total,
          Percentage,
          status,
        });
      } else {
        await marksSchema.create({
          Subjects,
          Total,
          Percentage,
          status,
          student_id: req.st_id,
        });
      }
      res.json({ messsage: "Your marks is inserted" });
    } catch (error) {
      res.json({ err: error.messsage });
    }
  },
  getWithScore: async (req, res) => {
    try {
      const { maxscore } = req.query;
      const result = await marksSchema
        .find({ Total: { $gte: Number(maxscore) } }, { student_id: 1 })
        .populate("student_id", "StudentName");
      res.json({ "No of students": result.length, "List of students": result });
    } catch (error) {
      res.json({ messsage: error.messsage });
    }
  },
  getWithHighmarks: async (req, res) => {
    try {
      var data = await marksSchema.aggregate([
        { $match: { "Subjects.marks": 90 } },
        {
          $lookup: {
            from: "students",
            localField: "student_id",
            foreignField: "_id",
            as: "Student",
          },
        },
        {
          $project: {
            "Student.StudentName": 1,
            "Subjects.name": 1,
            "Subjects.marks": 1,
          },
        },
        // {
        //   $group: {
        //     _id: ["$Student.StudentName", "$Subjects.marks"],
        //   },
        // },
      ]);
      var response = [];
      data.forEach((e) => {
        var store = [];
        e.Subjects.find((k) => {
          if (k.marks == 90) {
            store.push(k.name);
          }
        });
        if (store.length > 0) {
          response.push({
            name: e.Student[0].StudentName,
            subject: store,
          });
        }
      });
      res.json({ messsage: "List of students with subject marks", response });
    } catch (error) {
      res.json({ messsage: error });
    }
  },
  getstudentBtw: async (req, res) => {
    try {
      const { minmark, maxmark } = req.query;
      var response = await marksSchema.aggregate([
        {
          $unwind: {
            path: "$Subjects",
          },
        },
        {
          $match: {
            "Subjects.marks": { $gt: Number(minmark), $lt: Number(maxmark) },
            "Subjects.name": "Maths",
          },
        },
        {
          $lookup: {
            from: "students",
            localField: "student_id",
            foreignField: "_id",
            as: "Student",
          },
        },
        {
          $project: {
            "Student.StudentName": 1,
            "Subjects.name": 1,
            "Subjects.marks": 1,
            _id: 0,
          },
        },
      ]);
      res.json({
        "No of students": response.length,
        "List of students": response,
      });
    } catch (error) {
      res.json({ messsage: error.messsage });
    }
  },
  geMarks: async (req, res) => {
    try {
      const result = await marksSchema
        .find()
        .populate("student_id", "StudentName");
      res.json({ "Student report  card": result });
    } catch (error) {
      res.json({ messsage: error.messsage });
    }
  },
};
