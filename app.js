//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require("mysql");


const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

const port = process.env.PORT || 3000

var items = ["First Task", "Second Task", "Third Task"];

let userEmail;

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nodejs-login'
});

app.get("/", function(req, res) {
  res.render("index")
});

app.get("/aboutUs", function(req, res) {
  res.sendFile(__dirname + "public/aboutUs.html")
});

app.get("/contact", function(req, res) {
  res.sendFile(__dirname + "public/contact.html")
});

app.get("/login", function(req, res) {
  res.render('login')
});

app.get("/signup", function(req, res) {
  res.render("signup")
});

app.get("/today" ,function(req, res){
 // res.render("list",{Username:userEmail});

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
})
});

app.post("/signup", function(req, res) {

var firstName = req.body.firstname;
var lastName = req.body.lastname;
var email = req.body.email;
var password = req.body.password;

pool.getConnection((err, connection) => {
  if (err) throw err

  connection.query("INSERT INTO users (first_name, last_name, email, password) VALUES ('" + firstName + "', '" + lastName + "','" + email + "', '" + password + "')", (err, rows) => {
    connection.release()

    if (!err) {
      res.send(firstName + lastName + ' has been successfully signed up')
      res.render("/login")
    } else {
      console.log(err)
    }
  })
})

});


app.post("/login", function(req, res){
 userEmail = req.body.email;
 userPassword = req.body.password;
  console.log("success");
 pool.getConnection((err, connection) => {
  if (err) throw err

  connection.query("SELECT * FROM users WHERE email = '" + userEmail +"'",(err, rows)=>{
   connection.release()

   if(!err){
    if(userPassword == rows[0].password){



      res.redirect("/today");
    }
   }
   else{
    console.log(err)
   }
  })
})
});







// app.get("/list", function(req, res) {
//
//
//   var today = new Date();
//
//   var options = {
//     weekday: "long",
//     day: "numeric",
//     month: "long",
//     year: "numeric"
//   };
//
//   var day = today.toLocaleDateString("en-US", options);
//
//   res.render("list", {kindOfDay: day, newListItems: items});
//
//   res.render("list", {
//     kindOfDay: day
//   });
//
// });

app.get("/important", function(req, res){
  res.render("important", {newListItems: items});
});

// app.get("/upcoming", function(req, res){
//   res.render("upcoming", {newListItems: items});
// });

app.get("/history", function(req, res){
  res.render("history", {newListItems: items});
});

app.post("/today", function(req, res) {
  var item = req.body.newItem
  items.push(item);
  res.redirect("/today");
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
