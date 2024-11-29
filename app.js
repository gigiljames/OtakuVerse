const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const passport = require("./passport");
const methodOverride = require("method-override");
const adminRoute = require("./routes/adminRoute");
const custRoute = require("./routes/custRoute");
require("dotenv").config();
require("./models/insertSampleData");

const app = express();
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.set("Cache-control", "no-store");
  next();
});
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

mongoose
  .connect("mongodb://127.0.0.1:27017/OtakuVerse")
  .then((message) => {
    // console.log(message);
    app.listen(process.env.PORT, () => {
      console.log(`Listening at PORT ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/admin", adminRoute);
app.use("/", custRoute);

// app.use((req, res, next) => {
//   res.status(404).send("ERROR 404 NOT FOUND");
// });
