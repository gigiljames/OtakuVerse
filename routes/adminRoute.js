const express = require("express");
const login = require("../controllers/admin/adminLoginController");
const home = require("../controllers/admin/adminHomeController");
const customerManagement = require("../controllers/admin/adminCustomerManagementController");
const categoryManagement = require("../controllers/admin/adminCategoryManagementController");
const productManagement = require("../controllers/admin/adminProductManagementController");
const orderManagement = require("../controllers/admin/adminOrderManagement");
const couponManagement = require("../controllers/admin/adminCouponManagement");
const returnRequest = require("../controllers/admin/adminReturnRequestController");
const walletManagement = require("../controllers/admin/adminWalletManagement");
const upload = require("../upload");

const router = express.Router();
router.use(express.static("public"));

// CONSTANT LOGIN (For Development)
const constantLogin = async (req, res, next) => {
  const Admin = require("../models/adminModel");
  const admin = await Admin.findOne({});
  req.session.admin = admin._id;
  next();
};
router.use((req, res, next) => {
  constantLogin(req, res, next);
});

// AUTHENTICATION MIDDLEWARE
const authMiddleware = (req, res, next) => {
  if (!req.session.admin) {
    return res.redirect("/admin");
  }
  next();
};

// LOGIN
router.get("/", login.getPage);
router.post("/login", login.verify);
router.get("/logout", login.logout);

// HOME
router.get("/home", authMiddleware, home.getPage);
router.get("/get-sales-data", authMiddleware, home.getSalesData);
router.get("/get-custom-range-data", authMiddleware, home.getCustomRangeData);
router.get("/top-products", authMiddleware, home.getTopProducts);
router.get("/top-categories", authMiddleware, home.getTopCategories);

// CATEGORY MANAGEMENT
router.get("/category-management", authMiddleware, categoryManagement.getPage);
router.get("/category/:id", authMiddleware, categoryManagement.viewCategory);
router.post("/add-category", authMiddleware, categoryManagement.addCategory);
router.patch(
  "/edit-category/:catID",
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

// CUSTOMER MANAGEMENT
router.get("/customer-management", authMiddleware, customerManagement.getPage);
router.get("/get-customers", authMiddleware, customerManagement.getCustomers);
router.post("/add-customer", authMiddleware, customerManagement.addCustomer);
router.patch(
  "/block-customer/:id",
  authMiddleware,
  customerManagement.blockCustomer
);
router.patch(
  "/unblock-customer/:id",
  authMiddleware,
  customerManagement.unblockCustomer
);

// PRODUCT MANAGEMENT
router.get("/product-management", authMiddleware, productManagement.getPage);
router.get(
  "/product-management/product",
  authMiddleware,
  productManagement.viewProduct
);
router.post("/add-product", authMiddleware, productManagement.addProduct);
router.patch(
  "/enable-product/:id",
  authMiddleware,
  productManagement.enableProduct
);
router.patch(
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
// router.patch(
//   "/edit-order-status/:orderID",
//   authMiddleware,
//   orderManagement.editStatus
// );
router.patch(
  "/edit-item-status/:orderID/:variantID",
  authMiddleware,
  orderManagement.editItemStatus
);
router.delete(
  "/cancel-item/:orderID/:variantID",
  authMiddleware,
  orderManagement.cancelItem
);

// COUPON MANAGEMENT
router.get("/coupon-management", authMiddleware, couponManagement.getPage);
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

// RETURN REQUESTS
router.get("/return-requests", authMiddleware, returnRequest.getPage);
router.get(
  "/get-request-info/:requestID",
  authMiddleware,
  returnRequest.getRequestData
);
router.patch(
  "/edit-return-status/:requestID",
  authMiddleware,
  returnRequest.editRequestStatus
);
router.post(
  "/return-refund/:requestID",
  authMiddleware,
  returnRequest.returnRefund
);

module.exports = router;
