const Category = require("../../models/categoryModel");

const getPage = async (req, res) => {
  try {
    let categoryList = await Category.find({}, { category_name: 1 });
    // console.log(categoryList[0]._id.toString());
    res.render("admin/categoryManagement/category-list", { categoryList });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Category getPage.");
  }
};

const viewCategory = async (req, res) => {
  try {
    const categoryDetails = await Category.findOne({ _id: req.params.id });
    // res.send(categoryDetails);
    res.render("admin/categoryManagement/view-category", { categoryDetails });
  } catch (error) {
    console.log(error);
    console.log("ERROR : View Category.");
  }
};

const addCategory = async (req, res) => {
  try {
    const { name, desc } = req.body;
    const category = new Category({
      category_name: name,
      category_desc: desc,
    });
    const saveConfirmation = await category.save();
    if (saveConfirmation) {
      console.log("Added category successfully");
    } else {
      console.log("Add Category : Something went wrong.");
    }
    res.redirect("/admin/category-management");
  } catch (error) {
    console.log(error);
    console.log("ERROR : Add Category");
  }
};

const editCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, desc } = req.body;
    const editConfirmation = await Category.updateOne(
      { _id: id },
      { category_name: name, category_desc: desc }
    );
    if (editConfirmation) {
      console.log("Category edited successfully.");
      res.redirect(`/admin/category/${id}`);
    } else {
      console.log("Edit Category : Something went wrong.");
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Edit Category");
  }
};

module.exports = {
  getPage,
  viewCategory,
  addCategory,
  editCategory,
};
