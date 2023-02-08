const Studentmodel = require("../model/StudentSchema");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
module.exports = {
  studentvalidate: async (req, res, next) => {
    try {
      const Schema = Joi.object({
        StudentName: Joi.string().required(),
        Email: Joi.string()
          .email({
            minDomainSegments: 2,
            tlds: { allow: ["com", "net"] },
          })
          .required(),
        Password: Joi.string().required(),
        // Class: Joi.number().valid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10).required(),
        // Gender: Joi.string().valid("male", "female", "others").required(),
      });
      const result = Schema.validate(req.body);
      if (result.error) {
        res.json({ err: result.error.details[0].message });
      } else {
        next();
      }
    } catch (error) {
      res.json({ err: error.message });
    }
  },
  verifyToken: async (req, res, next) => {
    try {
      const bearerHeader = req.headers["authorization"];
      if (typeof bearerHeader !== "undefined") {
        try {
          const data = jwt.verify(bearerHeader, "secretKey");
          const result = await Studentmodel.findById(data.id);
          if (result) {
            req.st_id = data.id;
            next();
          } else {
            res.json({ message: "token is invalid please login again" });
          }
        } catch (error) {
          res.json({ err: error.message });
        }
      } else {
        res.json({ err: "Token must be mention" });
      }
    } catch (error) {
      res.json({ err: error.message });
    }
  },
  marksvalidate: async (req, res, next) => {
    try {
      const Schema = Joi.object({
        Subjects: Joi.array().items({
          name: Joi.string().required(),
          marks: Joi.number().integer().options({ convert: false }).required(),
        }),
      });
      req.body.Subjects.map((res) => (res.marks = Number(res.marks)))
      const result = Schema.validate(req.body);
      if (result.error) {
        res.json({ err: result.error.details[0].message });
      } else {
        next();
      }
    } catch (error) {
      res.json({ message: error.message });
    }
  },
};
