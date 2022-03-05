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

var items = [];



let userEmail;
let user = {
  id: "",
  email: "",
  password: "",
  post: "",
}


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

app.get("/error-login", function(req, res) {
  res.render("error")
});

app.get("/today", function(req, res) {
  // res.render("list",{Username:userEmail});
  var today = new Date();

  var options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  };

  pool.getConnection((err, connection) => {
    if (err) throw err
    const queryString = "SELECT * FROM tasks WHERE user_id = '" + user.id + "'"
    connection.query(queryString, (err, rows) => {

      items = []
      for (let i = 0; i < rows.length; i++) {
        items.push(rows[i]);
      }

      console.log(items);
      console.log("number of posts: " + rows.length);
      console.log("Getting data from database");

      var day = today.toLocaleDateString("en-US", options);
      res.render("today", {
        kindOfDay: day,
        newListItems: items,

      });

    });

  });

});




app.get("/important", function(req, res) {
  let importantItems = [];
  var important = req.body.button_fav;
  pool.getConnection((err, connection) => {
    if (err) throw err
    const queryString = "SELECT * FROM important WHERE user_id = '" + user.id + "'"
    connection.query(queryString, (err, rows) => {
      if (err) {
        console.log("Failed to query at " + err)
      }

      for (let i = 0; i < rows.length; i++) {
        importantItems.push(rows[i]);
      }

      console.log(importantItems);
      console.log("number of posts: " + rows.length);
      console.log("Getting data from database");


      res.render("important", {

        newListItems: importantItems,

      });

    });

  });
});


app.get("/history", function(req, res) {
  let historyItems = [];
  pool.getConnection((err, connection) => {
    if (err) throw err
    const queryString = "SELECT * FROM history WHERE user_id = '" + user.id + "'"
    connection.query(queryString, (err, rows) => {
      if (err) {
        console.log("Failed to query at " + err)
      }

      for (let i = 0; i < rows.length; i++) {
        historyItems.push(rows[i]);
      }

      console.log(historyItems);
      console.log("number of posts: " + rows.length);
      console.log("Getting data from database");


      res.render("history", {
        newListItems: historyItems,

      });

    });

  });
});

app.get("/logout", function(req, res) {
  items=[];
  importantItems = [];
  historyItems = [];
  user = {
    id: "",
    email: "",
    password: "",
    post: "",
  }
  console.log("logout success");
  console.log(items, importantItems, user);
  res.redirect("/");
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


app.post("/login", function(req, res) {
  userEmail = req.body.email;
  userPassword = req.body.password;
  pool.getConnection((err, connection) => {
    if (err){
      res.redirect("/error-login");
    };

    connection.query("SELECT * FROM users WHERE email = '" + userEmail + "'", (err, rows) => {
      connection.release()

      if (!err) {
        if (userPassword == rows[0].password) {

          user.email = rows[0].email;
          user.password = rows[0].password;
          user.id = rows[0].id;
          res.redirect("/today");
        } else {
          res.redirect("/error-login");
        }
      } else {
        res.redirect("/error-login");
      }
    })
  })
});

app.post("/error-login", function(req, res) {
  res.redirect("/login");
});

app.post("/today", function(req, res) {
var newTask = req.body.newItem;


pool.getConnection((err, connection) => {
  if (err) throw err

  connection.query("INSERT INTO tasks (post, user_id) VALUES ('" + newTask + "','" + user.id + "' )", (err, rows) => {
    // connection.release()
    connection.query("INSERT INTO history (post, user_id) VALUES ('" + newTask + "','" + user.id + "')", (err, rows) => {
      // connection.release()
      if (!err) {
        console.log("inserted successfully into history");
      }
    });
  });

  if (!err) {
    res.redirect("/today");
  } else {
    console.log(err)
  }


});

});




app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  var important = req.body.button_fav;
  var importantPost = req.body.itemName;

  pool.getConnection((err, connection) => {
    if (err) throw err

    connection.query("DELETE FROM tasks WHERE id = '" + checkedItemId + "'", (err, rows) => {
      connection.release()
      if (!err) {
        console.log("delete from tasks success id: " + checkedItemId);
        res.redirect("/today");
      } else {
        console.log(err)
      }
    })
  });
});

app.post("/delete:important", function(req, res) {
  const checkedItemIdimportant = req.body.checkbox_important;

  pool.getConnection((err, connection) => {
    if (err) throw err

    connection.query("DELETE FROM important WHERE id = '" + checkedItemIdimportant + "'", (err, rows) => {
      connection.release()
      if (!err) {
        console.log("delete from important success id: " + checkedItemIdimportant);
        res.redirect("/important");
      } else {
        console.log(err)
      }
    })
  });
});

app.post("/delete:history", function(req, res) {
  const checkedItemIdhistory = req.body.checkbox_history;

  pool.getConnection((err, connection) => {
    if (err) throw err

    connection.query("DELETE FROM history WHERE id = '" + checkedItemIdhistory + "'", (err, rows) => {
      connection.release()
      if (!err) {
        console.log("delete from history success id: " + checkedItemIdhistory);
        res.redirect("/history");
      } else {
        console.log(err)
      }
    })
  });
});



app.post("/important", function(req, res) {
  var important = req.body.button_fav;
  checkboxId = req.body.checkbox;
  pool.getConnection((err, connection) => {
    if (err) throw err

      connection.query("INSERT INTO important (tasks_id, post, user_id) VALUES ('" + checkboxId + "','" + important + "','" + user.id + "')", (err, rows) => {
        connection.release()
        if (!err) {
          console.log("inserted successfully into important");
          res.redirect("/important");
        }
      });
    });


});

app.post("/history", function(req, res) {
  // var item = req.body.newItem
  // items.push(item);
  // res.redirect("/");
});


app.listen(3000, function() {
  console.log("server started");
});
