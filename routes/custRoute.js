const express = require("express");
const login = require("../controllers/customer/custLoginController");
const home = require("../controllers/customer/custHomeController");
const signup = require("../controllers/customer/custSignupController");
const products = require("../controllers/customer/custProductsController");

const router = express.Router();
router.use(express.static("public"));

//Home
router.get("/", home.getPage);

//Login
router.get("/login", login.getPage);
router.get("/forgotpassword", login.forgotPassword);
router.get("/forgotpassword/otp", login.enterOTP);
router.get("/resetpassword", login.resetPassword);

//Signup
router.get("/signup", signup.getPage);
router.get("/signup/otp", signup.enterOTP);

//Products
router.get("/product", products.viewProduct);

module.exports = router;
