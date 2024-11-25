const express = require("express");
const login = require("../controllers/admin/adminLoginController");
const home = require("../controllers/admin/adminHomeController");
const customerManagement = require("../controllers/admin/adminCustomerManagementController");
const categoryManagement = require("../controllers/admin/adminCategoryManagementController");
const productManagement = require("../controllers/admin/adminProductManagementController");

const router = express.Router();
router.use(express.static("public"));

//Login
router.get("/login", login.getPage);
// router.post("/", login.verifyCeredentials);

//Home
router.get("/", home.getPage);

//Category management
router.get("/category-management", categoryManagement.getPage);
router.get("/category/:id", categoryManagement.viewCategory);
router.post("/add-category", categoryManagement.addCategory);
router.patch("/edit-category/:id", categoryManagement.editCategory);

//Customer management
router.get("/customer-management", customerManagement.getPage);
router.post("/add-customer", customerManagement.addCustomer);

//Product management
router.get("/product-management", productManagement.getPage);
router.get("/product-management/product", productManagement.viewProduct);

module.exports = router;
