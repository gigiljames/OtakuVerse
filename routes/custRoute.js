const express = require("express");
const login = require("../controllers/customer/custLoginController");
const home = require("../controllers/customer/custHomeController");
const signup = require("../controllers/customer/custSignupController");
const products = require("../controllers/customer/custProductsController");
const passport = require("passport");

const router = express.Router();
router.use(express.static("public"));

//Home
router.get("/", home.getPage);
router.get("/logout", home.logout);

//Login
router.get("/login", login.getPage);
router.post("/login", login.verify);

//Signup
router.get("/signup", signup.getPage);
router.post("/signup", signup.verify);
router.post("/verify-otp", signup.verifyOtp);
router.post("/resend-otp", signup.resendOtp);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/signup" }),
  (req, res) => {
    req.session.user = req.user._id;
    res.redirect("/");
  }
);

// router.use((req, res, next) => {
//   if (!req.session.user) {
//     return res.redirect("/login");
//   }
// });

//Products
router.get("/product/:id", products.viewProduct);

module.exports = router;
