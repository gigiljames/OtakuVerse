const express = require("express");
const login = require("../controllers/customer/custLoginController");
const home = require("../controllers/customer/custHomeController");
const signup = require("../controllers/customer/custSignupController");

const router = express.Router();
router.use(express.static("public"));

//Login
router.get("/", login.getPage);

//Signup
router.get("/signup", signup.getPage);

module.exports = router;
