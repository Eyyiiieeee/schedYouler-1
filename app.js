//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

var items = ["First Task", "Second Task", "Third Task"];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.get("/", function(req, res) {

  var today = new Date();

  var options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  };

  var day = today.toLocaleDateString("en-US", options);

  res.render("today", {kindOfDay: day, newListItems: items});

  res.render("today", {
    kindOfDay: day
  });

});

app.get("/important", function(req, res){
  res.render("important", {newListItems: items});
});

app.get("/upcoming", function(req, res){
  res.render("upcoming", {newListItems: items});
});

app.get("/history", function(req, res){
  res.render("history", {newListItems: items});
});

app.post("/", function(req, res) {
  var item = req.body.newItem
  items.push(item);
  res.redirect("/");
});

app.post("/important", function(req, res) {
  var item = req.body.newItem
  items.push(item);
  // res.redirect("/");
});

app.post("/upcoming", function(req, res) {
  var item = req.body.newItem
  items.push(item);
  // res.redirect("/");
});

app.post("/history", function(req, res) {
  // var item = req.body.newItem
  // items.push(item);
  // res.redirect("/");
});


app.listen(3000, function() {
      console.log("server started");
});
