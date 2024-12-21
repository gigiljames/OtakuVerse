const express = require("express");
const login = require("../controllers/customer/custLoginController");
const home = require("../controllers/customer/custHomeController");
const signup = require("../controllers/customer/custSignupController");
const products = require("../controllers/customer/custProductsController");
const passport = require("passport");
const order = require("../controllers/customer/custOrderController");

const router = express.Router();
router.use(express.static("public"));

// CONSTANT LOGIN (For Development)
const constantLogin = async (req, res, next) => {
  const Customer = require("../models/customerModel");
  const customer = await Customer.findOne({});
  req.session.user = customer._id;
  next();
};
router.use((req, res, next) => {
  constantLogin(req, res, next);
});

// AUTHENTICATION MIDDLEWARE
const authMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

//Home
router.get("/", home.getPage);
router.get("/logout", home.logout);
router.get("/profile", authMiddleware, home.getProfile);
router.post("/add-address", authMiddleware, home.addAddress);
router.patch("/edit-address/:id", authMiddleware, home.editAddress);
router.delete("/delete-address/:id", authMiddleware, home.deleteAddress);
router.patch("/edit-details", authMiddleware, home.editDetails);
router.get("/change-password", authMiddleware, home.changePasswordPage);
router.post("/change-password", authMiddleware, home.changePassword);

//Login
router.get("/login", login.getPage);
router.post("/login", login.verify);
router.get("/forgotpassword", login.forgotPassword);
router.post("/forgotpassword", login.sendOTP);
router.get("/forgotpassword/enter-otp", login.enterOTP);
router.post("/forgotpassword/enter-otp", login.verifyOTP);
router.get("/forgotpassword/resend-otp", login.resendOTP);
router.get("/resetpassword", login.resetPasswordPage);
router.post("/resetpassword", login.resetPassword);

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
  signup.verifyGoogleUser
);

//Products
router.get("/shop", products.getShopPage);
router.get("/get-products", products.getProducts);
router.get("/product/:id", products.viewProduct);

//Order
router.get("/cart", authMiddleware, order.cartPage);
router.post("/cart/:productID", authMiddleware, order.addToCart);
router.delete("/cart/:itemID", authMiddleware, order.removeFromCart);
router.delete("/cart/one/:productID", authMiddleware, order.removeOneFromCart);
router.get("/checkout", authMiddleware, order.checkout);
router.post("/place-order", authMiddleware, order.placeOrder);
router.get("/orders", authMiddleware, order.ordersPage);
router.delete(
  "/cancel-item/:orderID/:variantID",
  authMiddleware,
  order.cancelItem
);
router.delete("/cancel-order/:orderID", authMiddleware, order.cancelOrder);
// router.get("/wishlist", authMiddleware, order.wishlistPage);
// router.post("/wishlist/:productID", authMiddleware, order.addToWishlist);
// router.delete("/wishlist/:itemID", authMiddleware, order.removeFromWishlist);

module.exports = router;
