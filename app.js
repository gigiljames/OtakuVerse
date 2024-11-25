const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const adminRoute = require("./routes/adminRoute");
const custRoute = require("./routes/custRoute");
require("dotenv").config();
require("./models/insertSampleData");

const app = express();
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
