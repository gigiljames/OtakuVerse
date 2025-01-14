const Coupon = require("../../models/couponModel");

const getPage = async (req, res) => {
  try {
    const { offset } = req.query;
    const limit = 9;
    const couponCount = await Coupon.find().countDocuments();
    return res.render("admin/couponManagement/coupon-list", {
      pageCount: Math.ceil(couponCount / limit),
      offset,
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Coupon Management Get Page");
    return res.json({
      success: false,
      message: "An error occured while loading this page.",
    });
  }
};

const getCoupons = async (req, res) => {
  try {
    const { search, sort } = req.query;
    const offset = req.query.offset || 1;
    const limit = 9;
    const couponList = await Coupon.find({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ],
    })
      .skip(limit * (offset - 1))
      .limit(limit);
    // console.log(couponList);
    return res.json({
      success: true,
      couponList,
      offset,
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Get Coupons");
    return res.json({
      success: false,
      message: "An error occured while loading coupons.",
    });
  }
};

const addCoupon = async (req, res) => {
  try {
    const {
      title,
      description,
      code,
      value,
      type,
      availability,
      minSpent,
      uses,
    } = req.body;
    const couponExists = await Coupon.findOne({ code: code });
    console.log(couponExists);
    if (couponExists) {
      return res.json({
        success: false,
        message: "Coupon already exists.",
      });
    }
    const coupon = new Coupon({
      title: title,
      desc: description,
      code: code,
      value: value,
      is_percentage: type,
      is_enabled: availability,
      min_spent: minSpent,
      uses_per_person: uses,
    });
    await coupon.save();
    return res.json({
      success: true,
      message: "Coupon created successfully.",
      coupon: coupon,
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Add Coupon");
    return res.json({
      success: false,
      message: "An error occured while adding coupon.",
    });
  }
};

const editCoupon = async (req, res) => {
  try {
    const couponID = req.params.id;
    const { title, desc, code, value, type, minSpent, uses } = req.body;
    await Coupon.updateOne(
      { _id: couponID },
      {
        $set: {
          title: title,
          desc: desc,
          code: code,
          value: value,
          is_percentage: type,
          min_spent: minSpent,
          uses_per_person: uses,
        },
      }
    );
    return res.json({ success: true, message: "Coupon updated successfully." });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Edit Coupon");
  }
};

const enableCoupon = async (req, res) => {
  try {
    const couponID = req.params.id;
    await Coupon.updateOne({ _id: couponID }, { $set: { is_enabled: true } });
    return res.json({ success: true, message: "Coupon enabled successfully." });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Enable Coupon");
    return res.json({
      success: false,
      message: "An error occured while enabling coupon.",
    });
  }
};

const disableCoupon = async (req, res) => {
  try {
    const couponID = req.params.id;
    await Coupon.updateOne({ _id: couponID }, { $set: { is_enabled: false } });
    return res.json({
      success: true,
      message: "Coupon disabled successfully.",
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Disable Coupon");
    return res.json({
      success: false,
      message: "An error occured while disabling coupon.",
    });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const couponID = req.params.id;
    await Coupon.deleteOne({ _id: couponID });
    return res.json({ success: true, message: "Coupon deleted successfully." });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Delete Coupon");
    return res.json({
      success: false,
      message: "An error occured while deleting coupon.",
    });
  }
};

module.exports = {
  getPage,
  getCoupons,
  addCoupon,
  editCoupon,
  enableCoupon,
  disableCoupon,
  deleteCoupon,
};
