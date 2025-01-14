const fs = require("fs");
const Category = require("../../models/categoryModel");
const Product = require("../../models/productModel");

const getPage = async (req, res) => {
  try {
    let categoryList = await Category.find(
      { is_deleted: false },
      { category_name: 1 }
    );
    // console.log(categoryList[0]._id.toString());
    return res.render("admin/categoryManagement/category-list", {
      categoryList,
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Category getPage.");
  }
};

const viewCategory = async (req, res) => {
  try {
    const categoryDetails = await Category.findOne({ _id: req.params.id });
    // res.send(categoryDetails.banner_images);
    return res.render("admin/categoryManagement/view-category", {
      categoryDetails,
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : View Category.");
  }
};

const addCategory = async (req, res) => {
  try {
    let { name, desc, offer } = req.body;
    name = name.toLowerCase();
    const categoryExists = await Category.findOne({
      category_name: name,
      is_deleted: false,
    });
    if (categoryExists) {
      return res.json({ success: false, message: "Category already exists." });
    }
    const category = new Category({
      category_name: name,
      category_desc: desc,
      offer: offer,
    });
    const saveConfirmation = await category.save();
    return res.json({
      success: true,
      message: "Category added successfully.",
      id: saveConfirmation._id,
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Add Category");
  }
};

const editCategory = async (req, res) => {
  try {
    console.log(req.body.images);
    const { catID } = req.params;
    const category = await Category.findById(catID);
    if (category.category_name === "uncategorized") {
      return res.json({
        success: false,
        message: "This category cannot be edited.",
      });
    }
    const imageDocs = req.files.map((file) => ({
      filename: file.filename,
      filepath: file.path.slice(6), // removes "public" from path
    }));
    const id = req.params.catID;
    const { name, desc, offer } = req.body;
    const categoryExists = await Category.findOne({
      category_name: name,
      is_deleted: false,
      _id: { $ne: catID },
    });
    if (categoryExists) {
      return res.json({ success: false, message: "Category already exists." });
    }
    const editConfirmation = await Category.updateOne(
      { _id: id },
      {
        $set: { category_name: name, category_desc: desc, offer: offer },
        $push: { banner_images: { $each: imageDocs } },
      }
    );
    return res.json({
      success: true,
      message: "Category has been edited successfully.",
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Edit Category");
    return res.json({
      success: false,
      message: "An error occured while editing category.",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const keepProducts = JSON.parse(req.query.keepProducts); //Boolean("false") returned true XD
    console.log(keepProducts);
    const category = await Category.findById(id);
    if (category.category_name === "uncategorized") {
      return res.json({
        success: false,
        message: "This category cannot be deleted.",
      });
    }
    if (keepProducts) {
      const uncategorized = await Category.findOne({
        category_name: "uncategorized",
      });
      await Product.updateMany(
        { category: id },
        { $set: { category: uncategorized._id } }
      );
    } else {
      await Product.updateMany(
        { category: id },
        { $set: { is_deleted: true } }
      );
    }
    const deleteConfirmation = await Category.updateOne(
      { _id: id },
      { $set: { is_deleted: true } }
    );
    return res.json({
      success: true,
      message: "Category deleted successfully.",
      redirectUrl: "/admin/category-management",
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Delete Category");
    return res.json({
      success: false,
      message: "An error occured while deleting the category.",
    });
  }
};

const deleteCatBanner = async (req, res) => {
  try {
    const { catId, imgId } = req.params;
    const imagePath = await Category.findOne(
      { "banner_images._id": imgId },
      { "banner_images.filepath": 1 }
    );
    const deleteConfirmation = await Category.updateOne(
      { _id: catId },
      { $pull: { banner_images: { _id: imgId } } }
    );
    const filePath = imagePath.banner_images[0].filepath;
    fs.unlink("public" + filePath, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Image deleted from directory successfully.");
      }
    });
    console.log("Banner image deleted successfully");
    return res.json({
      success: true,
      message: "Banner image deleted successfully.",
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Delete Category Banner");
    return res.json({
      success: false,
      message: "An error occured while deleting banner image.",
    });
  }
};

module.exports = {
  getPage,
  viewCategory,
  addCategory,
  editCategory,
  deleteCategory,
  deleteCatBanner,
};
