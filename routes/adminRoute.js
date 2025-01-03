const express = require("express");
const login = require("../controllers/admin/adminLoginController");
const home = require("../controllers/admin/adminHomeController");
const customerManagement = require("../controllers/admin/adminCustomerManagementController");
const categoryManagement = require("../controllers/admin/adminCategoryManagementController");
const productManagement = require("../controllers/admin/adminProductManagementController");
const orderManagement = require("../controllers/admin/adminOrderManagement");
const couponManagement = require("../controllers/admin/adminCouponManagement");
const walletManagement = require("../controllers/admin/adminWalletManagement");
const upload = require("../upload");

const router = express.Router();
router.use(express.static("public"));

// // CONSTANT LOGIN (For Development)
const constantLogin = async (req, res, next) => {
  const Admin = require("../models/adminModel");
  const admin = await Admin.findOne({});
  req.session.admin = admin._id;
  next();
};
router.use((req, res, next) => {
  constantLogin(req, res, next);
});

// router.use((req, res, next) => {
//   if (!req.session.admin && req.path !== "/") {
//     return res.redirect("/admin");
//   }
//   next();
// });
const authMiddleware = (req, res, next) => {
  if (!req.session.admin) {
    return res.redirect("/admin");
  }
  next();
};

//Login
router.get("/", login.getPage);
router.post("/login", login.verify);
router.get("/logout", login.logout);

//Home
router.get("/home", authMiddleware, home.getPage);
router.get("/get-sales-data", authMiddleware, home.getSalesData);
router.get("/get-custom-range-data", authMiddleware, home.getCustomRangeData);
router.get("/download-sales-report", authMiddleware, home.downloadReport);

//Category management
router.get("/category-management", authMiddleware, categoryManagement.getPage);
router.get("/category/:id", authMiddleware, categoryManagement.viewCategory);
router.post("/add-category", authMiddleware, categoryManagement.addCategory);
router.patch(
  "/edit-category/:id",
  authMiddleware,
  upload.array("files", 10),
  categoryManagement.editCategory
);
router.delete(
  "/delete-category/:id",
  authMiddleware,
  categoryManagement.deleteCategory
);
router.delete(
  "/delete-catbanner/:catId/:imgId",
  authMiddleware,
  categoryManagement.deleteCatBanner
);

//Customer management
router.get("/customer-management", authMiddleware, customerManagement.getPage);
router.get("/get-customers", authMiddleware, customerManagement.getCustomers);
router.post("/add-customer", authMiddleware, customerManagement.addCustomer);
router.get(
  "/block-customer/:id",
  authMiddleware,
  customerManagement.blockCustomer
);
router.get(
  "/unblock-customer/:id",
  authMiddleware,
  customerManagement.unblockCustomer
);

//Product management
router.get("/product-management", authMiddleware, productManagement.getPage);
router.get(
  "/product-management/product",
  authMiddleware,
  productManagement.viewProduct
);
router.post("/add-product", authMiddleware, productManagement.addProduct);
router.get(
  "/enable-product/:id",
  authMiddleware,
  productManagement.enableProduct
);
router.get(
  "/disable-product/:id",
  authMiddleware,
  productManagement.disableProduct
);
router.get("/view-product/:id", authMiddleware, productManagement.viewProduct);
router.delete(
  "/delete-product/:id",
  authMiddleware,
  productManagement.deleteProduct
);
router.patch(
  "/edit-product/:id",
  authMiddleware,
  upload.single("images"),
  productManagement.editProduct
);
router.post(
  "/add-product-image/:id",
  upload.single("image"),
  authMiddleware,
  productManagement.addImage
);
router.delete(
  "/delete-product-image/:productId/:imgId",
  authMiddleware,
  productManagement.deleteImage
);
router.post("/add-variant/:id", authMiddleware, productManagement.addVariant);
router.delete(
  "/delete-variant/:productId/:variantId",
  authMiddleware,
  productManagement.deleteVariant
);
router.patch(
  "/edit-stock/:variantID",
  authMiddleware,
  productManagement.editStock
);

// ORDER MANAGEMENT
router.get("/order-management", authMiddleware, orderManagement.getPage);
router.delete(
  "/cancel-order/:orderID",
  authMiddleware,
  orderManagement.cancelOrder
);
router.patch(
  "/edit-order-status/:orderID",
  authMiddleware,
  orderManagement.editStatus
);

// COUPON MANAGEMENT
router.get("/coupon-management", authMiddleware, couponManagement.getPage);
router.get("/get-coupons", authMiddleware, couponManagement.getCoupons);
router.post("/add-coupon", authMiddleware, couponManagement.addCoupon);
router.patch("/edit-coupon/:id", authMiddleware, couponManagement.editCoupon);
router.get("/enable-coupon/:id", authMiddleware, couponManagement.enableCoupon);
router.get(
  "/disable-coupon/:id",
  authMiddleware,
  couponManagement.disableCoupon
);
router.delete(
  "/delete-coupon/:id",
  authMiddleware,
  couponManagement.deleteCoupon
);

// WALLET MANAGEMENT
router.get("/wallet-management", authMiddleware, walletManagement.getPage);

module.exports = router;
