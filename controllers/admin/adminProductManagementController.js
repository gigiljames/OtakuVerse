const mongoose = require("mongoose");
const fs = require("fs");
const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");
const ProductVariant = require("../../models/productVariantModel");
const upload = require("../../helpers/upload");

const getPage = async (req, res) => {
  try {
    const { offset } = req.query;
    const limit = 10;
    const productCount = await Product.find({
      is_deleted: false,
    }).countDocuments();
    const productList = await Product.find({ is_deleted: false })
      .skip(limit * (offset - 1))
      .limit(limit)
      .populate("category", "category_name");
    const categoryList = await Category.find(
      { is_deleted: false },
      { category_name: 1 }
    );
    return res.render("admin/productManagement/product-list", {
      productList,
      categoryList,
      pageCount: Math.ceil(productCount / limit),
      offset,
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Product List");
  }
};

const viewProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productDetails = await Product.findOne({ _id: id }).populate(
      "category"
    );
    const variants = await Product.findOne(
      { _id: id },
      { variants: 1 }
    ).populate("variants");
    // console.log(variants);
    const categoryList = await Category.find(
      { is_deleted: false },
      { category_name: 1 }
    );
    return res.render("admin/productManagement/view-product", {
      productDetails,
      categoryList,
      variants,
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : View Product");
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, category, price, discount, visibility, desc, specs } =
      req.body;
    const product = new Product({
      product_name: name,
      category: category,
      price: Number(price),
      discount: Number(discount),
      is_enabled: visibility,
      product_desc: desc,
      product_specs: specs,
    });
    await product.save();
    return res.json({ success: true, message: "Product added successfully" });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Add Product");
  }
};

const enableProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.updateOne({ _id: id }, { $set: { is_enabled: true } });
    return res.json({
      success: true,
      message: "Product enabled successfully",
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Enable Product");
  }
};

const disableProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.updateOne({ _id: id }, { $set: { is_enabled: false } });
    return res.json({
      success: true,
      message: "Product disabled successfully",
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Disable Product");
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.updateOne({ _id: id }, { $set: { is_deleted: true } });
    return res.json({
      success: true,
      message: "Product deleted successfully",
      redirectUrl: "/admin/product-management?offset=1",
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Delete Product");
  }
};

const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, desc, category, discount, visibility, specs } =
      req.body;
    await Product.updateOne(
      { _id: id },
      {
        $set: {
          product_name: name,
          product_desc: desc,
          product_specs: specs,
          category: category,
          price: price,
          discount: discount,
          is_enabled: visibility,
        },
      }
    );
    return res.json({ success: true, message: "Product edited successfully" });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Edit Product");
  }
};

const addImage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await upload.uploadFile(req.file.path);
    const imageDoc = {
      filename: req.file.filename,
      filepath: result.secure_url,
    };
    await Product.updateOne(
      { _id: id },
      {
        $push: { product_images: imageDoc },
      }
    );
    return res.json({ success: true, message: "Image added successfully." });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Add Image");
  }
};

const deleteImage = async (req, res) => {
  try {
    const { productId, imgId } = req.params;
    await Product.updateOne(
      { _id: productId },
      { $pull: { product_images: { _id: imgId } } }
    );
    return res.redirect(`/admin/view-product/${productId}`);
  } catch (error) {
    console.log(error);
    console.log("ERROR : Delete Image");
  }
};

const addVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { size, colour, stock } = req.body;
    // Creating and saving new variant object
    const variant = new ProductVariant({
      product_id: id,
      size,
      colour,
      stock_quantity: stock,
    });
    await variant.save();
    // Updating variant in product collection
    await Product.updateOne({ _id: id }, { $push: { variants: variant._id } });
    return res.json({ success: true, message: "Variant added successfully" });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Add Variant");
  }
};

const deleteVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    // console.log(productId, variantId);
    await Product.updateOne(
      { _id: productId },
      { $pull: { variants: variantId } }
    );
    await ProductVariant.deleteOne({
      _id: variantId,
    });
    return res.json({
      success: true,
      message: "Variant deleted successfully.",
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Delete Variant");
  }
};

const editStock = async (req, res) => {
  try {
    const { variantID } = req.params;
    const { stock } = req.body;
    await ProductVariant.updateOne(
      { _id: variantID },
      { $set: { stock_quantity: stock } }
    );
    return res.json({ success: true, message: "Stock updated successfully." });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Edit Variant");
  }
};

module.exports = {
  getPage,
  viewProduct,
  addProduct,
  enableProduct,
  disableProduct,
  deleteProduct,
  editProduct,
  addImage,
  deleteImage,
  addVariant,
  deleteVariant,
  editStock,
};
