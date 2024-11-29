const express = require("express");
const login = require("../controllers/admin/adminLoginController");
const home = require("../controllers/admin/adminHomeController");
const customerManagement = require("../controllers/admin/adminCustomerManagementController");
const categoryManagement = require("../controllers/admin/adminCategoryManagementController");
const productManagement = require("../controllers/admin/adminProductManagementController");
const upload = require("../upload");

const router = express.Router();
router.use(express.static("public"));

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
router.post("/verify", login.verify);
router.get("/logout", login.logout);

//Home
router.get("/home", authMiddleware, home.getPage);

//Category management
router.get("/category-management", authMiddleware, categoryManagement.getPage);
router.get("/category/:id", authMiddleware, categoryManagement.viewCategory);
router.post("/add-category", authMiddleware, categoryManagement.addCategory);
router.patch(
  "/edit-category/:id",
  authMiddleware,
  upload.array("images", 10),
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
  upload.array("images", 10),
  productManagement.editProduct
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

module.exports = router;
