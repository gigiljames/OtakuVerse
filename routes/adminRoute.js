const express = require("express");
const login = require("../controllers/admin/adminLoginController");
const home = require("../controllers/admin/adminHomeController");
const customerManagement = require("../controllers/admin/adminCustomerManagementController");
const categoryManagement = require("../controllers/admin/adminCategoryManagementController");
const productManagement = require("../controllers/admin/adminProductManagementController");

const router = express.Router();
router.use(express.static("public"));

//Login
// router.get("/admin", login.getPage);
// router.post("/", login.verifyCeredentials);
//Home
// router.get("/home", home.getPage);
//Customer management

//Category management

//Product management

module.exports = router;
