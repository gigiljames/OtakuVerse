const Address = require("../../models/addressModel");
const Cart = require("../../models/cartModel");
const Category = require("../../models/categoryModel");
const Coupon = require("../../models/couponModel");
const CouponUses = require("../../models/couponUsesModel");
const Customer = require("../../models/customerModel");
const Order = require("../../models/orderModel");
const Product = require("../../models/productModel");
const Wishlist = require("../../models/wishlistModel");
const ProductVariant = require("../../models/productVariantModel");
const Wallet = require("../../models/walletModel");
const Razorpay = require("razorpay");
require("dotenv").config();
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

async function getCategoryList() {
  const categoryList = await Category.find(
    { is_deleted: false, is_enabled: true },
    { category_name: 1 }
  );
  return categoryList;
}

const getBill = function (cart) {
  let bill = {
    subtotal: 0,
    delivery_charges: 80,
    total: 0,
    discount: 0,
    free_delivery: -80,
    grand_total: 0,
    you_save: 0,
    you_save_percent: 0,
    total_quantity: 0,
    coupon_discount: 0,
  };
  cart.cart_items.forEach((item) => {
    if (item.variant_id.stock_quantity !== 0) {
      const product = item.product_id;
      bill.subtotal += product.price * item.quantity;
      bill.grand_total += product.offer_price * item.quantity;
      bill.discount -=
        product.offer_price * item.quantity * (product.applied_discount / 100);
      bill.total_quantity += item.quantity;
    }
  });
  bill.total = bill.subtotal + bill.delivery_charges;
  bill.grand_total += bill.delivery_charges + bill.free_delivery;
  bill.subtotal = bill.subtotal.toFixed(2);
  bill.discount = bill.discount.toFixed(2);
  bill.total = bill.total.toFixed(2);
  const appliedCoupon = cart.coupon_id;
  if (appliedCoupon && appliedCoupon.min_spent < bill.grand_total) {
    if (appliedCoupon.isPercentage) {
      bill.coupon_discount = (
        (appliedCoupon.value / 100) *
        bill.grand_total
      ).toFixed(2);
      bill.grand_total -= bill.coupon_discount;
    } else {
      bill.grand_total -= appliedCoupon.value;
      bill.coupon_discount -= appliedCoupon.value;
    }
  }
  bill.you_save = bill.total - bill.grand_total;
  bill.you_save_percent = (bill.you_save * 100) / bill.total;
  bill.grand_total = bill.grand_total.toFixed(2);
  bill.you_save = bill.you_save.toFixed(2);
  bill.you_save_percent = bill.you_save_percent.toFixed(2);
  return bill;
};

const checkout = async (req, res) => {
  try {
    const categoryList = await getCategoryList();
    const coupons = await Coupon.find({ is_enabled: true });
    const custID = req.session.user;
    const addresses = await Address.find({ customer_id: custID });
    const cart = await Cart.findOne({ customer_id: custID })
      .populate(
        "cart_items.product_id",
        "product_name price discount product_images category"
      )
      .populate("cart_items.variant_id");
    await cart.populate("cart_items.product_id.category", "offer");
    const plainCart = cart.toObject();
    plainCart.cart_items.forEach((product) => {
      product = product.product_id;
      let highestOffer =
        product.discount > product.category.offer
          ? product.discount
          : product.category.offer;
      let offerPrice = (product.price * (1 - highestOffer / 100)).toFixed(2);
      product.offer_price = offerPrice;
      product.applied_discount = highestOffer;
      // console.log(product.applied_discount);
    });
    const bill = getBill(plainCart);
    res.render("customer/order/cust-checkout", {
      categoryList,
      bill,
      addresses,
      coupons,
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Checkout");
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { couponID } = req.params;
    //check uses limit
    const custID = req.session.user;
    await Cart.updateOne(
      { customer_id: custID },
      { $set: { coupon_id: couponID } }
    );
    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Apply Coupon");
  }
};

const removeCoupon = async (req, res) => {
  try {
    const custID = req.session.user;
    await Cart.updateOne(
      { customer_id: custID },
      { $set: { coupon_id: null } }
    );
    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Remove Coupon");
  }
};

const refreshBill = async (req, res) => {
  try {
    const custID = req.session.user;
    const cart = await Cart.findOne({ customer_id: custID })
      .populate(
        "cart_items.product_id",
        "product_name price discount product_images category"
      )
      .populate("cart_items.variant_id");
    await cart.populate("cart_items.product_id.category", "offer");
    await cart.populate("coupon_id");
    const plainCart = cart.toObject();
    plainCart.cart_items.forEach((product) => {
      product = product.product_id;
      let highestOffer =
        product.discount > product.category.offer
          ? product.discount
          : product.category.offer;
      let offerPrice = (product.price * (1 - highestOffer / 100)).toFixed(2);
      product.offer_price = offerPrice;
      product.applied_discount = highestOffer;
    });
    const bill = getBill(plainCart);
    return res.json({ success: true, bill });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Refresh Bill");
  }
};

const createOrder = async (req, res) => {
  try {
    const custID = req.session.user;
    const { addressID } = req.body;
    let { amount } = req.body;
    const addressFromDB = await Address.findById(addressID);
    let address = {
      recipient_name: addressFromDB.recipient_name,
      apartment: addressFromDB.apartment,
      city: addressFromDB.city,
      street: addressFromDB.street,
      state: addressFromDB.state,
      pincode: addressFromDB.pincode,
      phone_number: addressFromDB.phone_number,
    };
    const cart = await Cart.findOne({ customer_id: custID })
      .populate("cart_items.variant_id", "colour size")
      .populate(
        "cart_items.product_id",
        "price discount product_name product_images category"
      );
    await cart.populate("cart_items.product_id.category", "offer");
    const plainCart = cart.toObject();
    plainCart.cart_items.forEach((product) => {
      product = product.product_id;
      let highestOffer =
        product.discount > product.category.offer
          ? product.discount
          : product.category.offer;
      let offerPrice = (product.price * (1 - highestOffer / 100)).toFixed(2);
      product.offer_price = offerPrice;
      product.applied_discount = highestOffer;
    });
    const cartWithQty = await Cart.findOne(
      { customer_id: custID },
      { cart_items: 1 }
    )
      .populate("cart_items.variant_id", "stock_quantity")
      .populate("cart_items.product_id", "product_name");
    //checking stock availability
    let flag = 0;
    let outOfStockMessage = "";
    cartWithQty.cart_items.forEach((item) => {
      if (item.quantity > item.variant_id.stock_quantity) {
        flag = 1;
        outOfStockMessage += `${item.product_id.product_name} just got out of stock.\n`;
      }
    });
    if (flag === 1) {
      return res.json({ success: false, message: outOfStockMessage });
    } else {
      //updating stock
      cartWithQty.cart_items.forEach(async (item) => {
        await ProductVariant.updateOne(
          { _id: item.variant_id },
          { $inc: { stock_quantity: -item.quantity } }
        );
      });
      const cartItems = plainCart.cart_items;
      let orderItems = cartItems.map((item) => {
        return {
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_name: item.product_id.product_name,
          price: item.product_id.offer_price,
          discount: item.product_id.applied_discount,
          product_images: item.product_id.product_images.slice(0, 1),
          colour: item.variant_id.colour,
          size: item.variant_id.size,
          quantity: item.quantity,
        };
      });

      let date = new Date();
      date.setDate(date.getDate() + 7);
      const DBOrder = new Order({
        customer_id: custID,
        payment_type: "razorpay",
        amount: amount,
        address: address,
        order_items: orderItems,
        delivery_date: date,
      });
      //clearing cart
      await Cart.updateOne(
        { customer_id: custID },
        { $set: { cart_items: [] } }
      );
      await DBOrder.save();
      // return res.json({
      //   success: true,
      //   message: "Order placed successfully.",
      //   redirectUrl: "/orders",
      // });
      const upiAmount = Math.round(amount * 100);
      const options = {
        amount: upiAmount,
        currency: "INR",
      };
      razorpayInstance.orders.create(options, (err, order) => {
        if (!err) {
          return res.json({
            success: true,
            order_id: order.id,
            amount: upiAmount,
            key_id: RAZORPAY_ID_KEY,
            DBOrderID: DBOrder._id,
          });
        } else {
          return res.json({
            success: false,
            message: "An error occured while initiating Razorpay payment.",
          });
        }
      });
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Create Order");
    return res.json({
      success: false,
      message: "An error occured while creating order.",
    });
  }
};

const editPaymentStatus = async (req, res) => {
  try {
    const { orderID } = req.params;
    const { status } = req.query;
    await Order.updateOne(
      { _id: orderID },
      { $set: { payment_status: status } }
    );
    return res.json({ success: true, redirectUrl: "/orders" });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Edit Payment Status - Customer");
  }
};

const placeOrder = async (req, res) => {
  try {
    const custID = req.session.user;
    const { addressID } = req.body;
    let { amount } = req.body;
    const addressFromDB = await Address.findById(addressID);
    let address = {
      recipient_name: addressFromDB.recipient_name,
      apartment: addressFromDB.apartment,
      city: addressFromDB.city,
      street: addressFromDB.street,
      state: addressFromDB.state,
      pincode: addressFromDB.pincode,
      phone_number: addressFromDB.phone_number,
    };
    const cart = await Cart.findOne({ customer_id: custID })
      .populate("cart_items.variant_id", "colour size")
      .populate(
        "cart_items.product_id",
        "price discount product_name product_images category"
      );
    await cart.populate("cart_items.product_id.category", "offer");
    const plainCart = cart.toObject();
    plainCart.cart_items.forEach((product) => {
      product = product.product_id;
      let highestOffer =
        product.discount > product.category.offer
          ? product.discount
          : product.category.offer;
      let offerPrice = (product.price * (1 - highestOffer / 100)).toFixed(2);
      product.offer_price = offerPrice;
      product.applied_discount = highestOffer;
    });
    const cartWithQty = await Cart.findOne(
      { customer_id: custID },
      { cart_items: 1 }
    )
      .populate("cart_items.variant_id", "stock_quantity")
      .populate("cart_items.product_id", "product_name");
    //checking stock availability
    let flag = 0;
    let outOfStockMessage = "";
    cartWithQty.cart_items.forEach((item) => {
      if (item.quantity > item.variant_id.stock_quantity) {
        flag = 1;
        outOfStockMessage += `${item.product_id.product_name} just got out of stock.\n`;
      }
    });
    if (flag === 1) {
      return res.json({ success: false, message: outOfStockMessage });
    } else {
      //updating stock
      cartWithQty.cart_items.forEach(async (item) => {
        await ProductVariant.updateOne(
          { _id: item.variant_id },
          { $inc: { stock_quantity: -item.quantity } }
        );
      });
      const cartItems = plainCart.cart_items;
      let orderItems = cartItems.map((item) => {
        return {
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_name: item.product_id.product_name,
          price: item.product_id.offer_price,
          discount: item.product_id.applied_discount,
          product_images: item.product_id.product_images.slice(0, 1),
          colour: item.variant_id.colour,
          size: item.variant_id.size,
          quantity: item.quantity,
        };
      });
      let date = new Date();
      date.setDate(date.getDate() + 7);
      const order = new Order({
        customer_id: custID,
        payment_type: "cod",
        amount: amount,
        address: address,
        order_items: orderItems,
        delivery_date: date,
        payment_status: "pending",
      });
      console.log(order.order_items);
      //clearing cart
      await Cart.updateOne(
        { customer_id: custID },
        { $set: { cart_items: [] } }
      );
      await order.save();
      return res.json({
        success: true,
        message: "Order placed successfully.",
        redirectUrl: "/orders",
      });
    }

    // console.log(order);
  } catch (error) {
    console.log(error);
    console.log("ERROR : Place Order");
  }
};

const ordersPage = async (req, res) => {
  try {
    const custID = req.session.user;
    const orders = await Order.find({ customer_id: custID }).populate(
      "address"
    );
    const categoryList = await getCategoryList();
    res.render("customer/order/cust-orders", { orders, categoryList });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Orders Page");
  }
};

const cancelItem = async (req, res) => {
  try {
    const { orderID, variantID } = req.params;
    const { qty } = req.body;
    //pull value
    await Order.updateOne(
      { _id: orderID },
      {
        $pull: {
          order_items: { variant_id: variantID },
        },
      }
    );
    //update stock
    await ProductVariant.updateOne(
      { _id: variantID },
      { $inc: { stock_quantity: qty } }
    );
    // url adichu keriyalum error varathe irikkan ulla validation cheyyanam
    // ippol button hide cheythitte ollu
    res.json({
      success: true,
      message: "Item has been cancelled successfully.",
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Cancel Item");
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderID } = req.params;
    const custID = req.session.user;
    const order = await Order.findById(orderID);
    //refund
    if (
      order.payment_type === "razorpay" &&
      order.payment_status === "completed"
    ) {
      const amount = order.amount;
      const transaction = {
        amount: amount,
        transactionType: "credit",
      };
      await Wallet.updateOne(
        { customer_id: custID },
        {
          $inc: { balance: amount },
          $push: { transaction_history: transaction },
        },
        { upsert: true }
      );
    }

    //re-stock
    order.order_items.forEach(async (item) => {
      await ProductVariant.updateOne(
        { _id: item.variant_id },
        { $inc: { stock_quantity: item.quantity } }
      );
    });
    //cancel order
    await Order.updateOne(
      { _id: orderID },
      { $set: { order_status: "cancelled" } }
    );
    res.json({
      success: true,
      message: "Order has been cancelled successfully.",
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Cancel Order");
  }
};

module.exports = {
  checkout,
  applyCoupon,
  removeCoupon,
  refreshBill,
  createOrder,
  editPaymentStatus,
  placeOrder,
  ordersPage,
  cancelItem,
  cancelOrder,
};
