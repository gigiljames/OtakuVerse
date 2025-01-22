const express = require("express");
const login = require("../controllers/customer/custLoginController");
const home = require("../controllers/customer/custHomeController");
const signup = require("../controllers/customer/custSignupController");
const products = require("../controllers/customer/custProductsController");
const passport = require("passport");
const cart = require("../controllers/customer/custCartController");
const order = require("../controllers/customer/custOrderController");
const wallet = require("../controllers/customer/custWalletController");
const Customer = require("../models/customerModel");

const router = express.Router();
router.use(express.static("public"));

// CONSTANT LOGIN (For Development)
// const constantLogin = async (req, res, next) => {
//   const Customer = require("../models/customerModel");
//   const customer = await Customer.findOne({
//     customer_email: "hrx@fakemail.com",
//   });
//   req.session.user = customer._id;
//   next();
// };
// router.use((req, res, next) => {
//   constantLogin(req, res, next);
// });

// AUTHENTICATION MIDDLEWARE
const authMiddleware = async (req, res, next) => {
  if (!req.session.user) {
    if (req.xhr) {
      // distinguishing btw ajax and normal req
      return res.json({ success: false, redirectUrl: "/login" });
    }
    return res.redirect("/login");
  } else {
    const customer = await Customer.findOne(
      { _id: req.session.user },
      { account_status: 1 }
    );
    if (customer && customer.account_status === "banned") {
      if (req.xhr) {
        return res.json({ success: false, redirectUrl: "/logout" });
      }
      return res.redirect("/logout");
    }
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

//LOGIN

//Login verification
router.get("/login", login.getPage);
router.post("/login", login.verify);
//Forgot password
router.get("/forgotpassword", login.forgotPassword);
router.post("/forgotpassword", login.sendOTP);
router.get("/forgotpassword/enter-otp", login.enterOTP);
router.post("/forgotpassword/enter-otp", login.verifyOTP);
router.get("/forgotpassword/resend-otp", login.resendOTP);
router.get("/resetpassword", login.resetPasswordPage);
router.post("/resetpassword", login.resetPassword);

//SIGNUP

//Signup verification
router.get("/signup", signup.getPage);
router.post("/signup", signup.verify);
router.post("/verify-otp", signup.verifyOtp);
router.post("/resend-otp", signup.resendOtp);
//Google auth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/signup" }),
  signup.verifyGoogleUser
);

//PRODUCTS
router.get("/shop", products.getShopPage);
router.get("/get-products", products.getProducts);
router.get("/product/:id", products.viewProduct);

//ORDER

//Cart
router.get("/cart", authMiddleware, cart.cartPage);
router.get("/cart/refresh-bill", authMiddleware, cart.refreshBill);
router.post("/cart/:productID", authMiddleware, cart.addToCart);
router.delete("/cart/:itemID", authMiddleware, cart.removeFromCart);
router.delete("/cart/one/:productID", authMiddleware, cart.removeOneFromCart);
//Checkout & Order functions
router.get("/checkout", authMiddleware, order.checkout);
router.patch("/apply-coupon/:couponID", authMiddleware, order.applyCoupon);
router.patch("/remove-coupon", authMiddleware, order.removeCoupon);
router.get("/refresh-bill", authMiddleware, order.refreshBill);
router.post("/create-order", authMiddleware, order.createOrder);
router.post("/retry-payment/:orderID", authMiddleware, order.retryPayment);
router.patch(
  "/edit-payment-status/:orderID",
  authMiddleware,
  order.editPaymentStatus
);
router.post("/place-order", authMiddleware, order.placeOrder);
router.get("/orders", authMiddleware, order.ordersPage);
router.delete(
  "/cancel-item/:orderID/:variantID",
  authMiddleware,
  order.cancelItem
);
router.delete("/cancel-order/:orderID", authMiddleware, order.cancelOrder);
router.post(
  "/return-request/:orderID/:variantID",
  authMiddleware,
  order.returnItem
);
router.get("/get-invoice/:orderID", authMiddleware, order.getInvoice);
//Wishlist
router.get("/wishlist", authMiddleware, cart.wishlistPage);
router.post("/wishlist/:productID", authMiddleware, cart.addToWishlist);
router.delete("/wishlist/:itemID", authMiddleware, cart.removeFromWishlist);

//WALLET
router.get("/wallet", authMiddleware, wallet.getPage);

module.exports = router;
