const express = require("express");
const adminRoute = require("./routes/adminRoute");
const custRoute = require("./routes/custRoute");
require("dotenv").config();

let app = express();
app.set("view engine", "ejs");

app.listen(process.env.PORT, () => {
  console.log(`Listening at PORT ${process.env.PORT}`);
});

app.use("/admin/", adminRoute);
app.use("/", custRoute);
