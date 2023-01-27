const express = require("express");

const Router = express.Router();

Router.get("/", (req, res) => {
  res.render("index", { title: "Sign Up" });
});
Router.get("/register", (req, res) => {
  res.render("register", { title: "register" });
});
Router.get("/list", (req, res) => {
  res.redirect("/api/student/getalldata");
});

module.exports = Router;
