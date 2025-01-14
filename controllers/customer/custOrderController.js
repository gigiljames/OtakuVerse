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
        product.price * item.quantity * (product.applied_discount / 100);
      bill.total_quantity += item.quantity;
    }
  });
  bill.total = bill.subtotal + bill.delivery_charges;
  bill.grand_total += bill.delivery_charges + bill.free_delivery;
  bill.subtotal = bill.subtotal.toFixed(2);
  bill.discount = bill.discount.toFixed(2);
  bill.total = bill.total.toFixed(2);
  const appliedCoupon = cart.coupon_id;
  if (appliedCoupon) {
    if (appliedCoupon.is_percentage) {
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
    //removing any already applied coupons
    await Cart.updateOne(
      { customer_id: custID },
      { $set: { coupon_id: null } }
    );
    let cart = await Cart.findOne({ customer_id: custID })
      .populate(
        "cart_items.product_id",
        "product_name price discount product_images category"
      )
      .populate("cart_items.variant_id");
    await cart.populate("cart_items.product_id.category", "offer");

    //Finding deleted products or variants from items included in cart and removing them
    const deletedItems = [];
    cart.cart_items.forEach((item) => {
      if (item.variant_id === null || item.product_id === null) {
        deletedItems.push(item._id);
      }
    });
    await Cart.updateOne(
      { customer_id: custID },
      {
        $pull: {
          cart_items: {
            _id: { $in: deletedItems },
          },
        },
      }
    );

    cart = await Cart.findOne({ customer_id: custID })
      .populate(
        "cart_items.product_id",
        "product_name price discount product_images category"
      )
      .populate("cart_items.variant_id");
    await cart.populate("cart_items.product_id.category", "offer");
    if (cart.cart_items.length === 0) {
      res.redirect("/cart");
    }

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
    const custID = req.session.user;
    const coupon = await Coupon.findById(couponID);
    const uses = await CouponUses.find({
      customer_id: custID,
      code: coupon.code,
    });
    // console.log(uses);
    if (uses.length >= coupon.uses_per_person) {
      return res.json({
        success: false,
        message: `Maximum uses reached.`,
      });
    }
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
    });
    const bill = getBill(plainCart);
    if (bill.grand_total < coupon.min_spent) {
      return res.json({
        success: false,
        message: `This coupon is only applicable for orders above Rs.${coupon.min_spent}`,
      });
    }
    //check max uses

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
    let cart = await Cart.findOne({ customer_id: custID })
      .populate("cart_items.variant_id", "colour size")
      .populate(
        "cart_items.product_id",
        "price discount product_name product_images category"
      );

    //Finding deleted products or variants from items included in cart
    cart.cart_items.forEach((item) => {
      if (item.variant_id === null || item.product_id === null) {
        res.json({
          success: false,
          message:
            "One or more products have been deleted. Please try placing a new order.",
          redirectUrl: "/cart",
        });
      }
    });

    cart = await Cart.findOne({ customer_id: custID })
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
    const amount = bill.grand_total;
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
      let coupon_applied = {
        value: 0,
        is_percentage: false,
      };
      if (plainCart.coupon_id) {
        coupon_applied = {
          code: plainCart.coupon_id.code,
          value: plainCart.coupon_id.value,
          is_percentage: plainCart.coupon_id.is_percentage,
        };
      }
      // console.log("coupon applied");
      // console.log(coupon_applied);
      let date = new Date();
      date.setDate(date.getDate() + 7);
      const DBOrder = new Order({
        customer_id: custID,
        payment_type: "razorpay",
        amount: amount,
        address: address,
        order_items: orderItems,
        delivery_date: date,
        coupon_applied: coupon_applied,
      });
      //Registering coupon use
      if (plainCart.coupon_id) {
        await CouponUses.insertMany([
          {
            coupon_id: plainCart.coupon_id?._id,
            code: plainCart.coupon_id?.code,
            customer_id: custID,
            order_id: DBOrder._id,
          },
        ]);
      }
      //clearing cart
      await Cart.updateOne(
        { customer_id: custID },
        { $set: { cart_items: [], coupon_id: null } }
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
      razorpayInstance.orders.create(options, async (err, order) => {
        if (!err) {
          DBOrder.razorpay_order_id = order.id;
          await DBOrder.save();
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

const retryPayment = async (req, res) => {
  try {
    const { orderID } = req.params;
    const order = await Order.findById(orderID);
    if (
      order.payment_type === "razorpay" &&
      order.payment_status === "failed" &&
      order.razorpay_order_id
    ) {
      const upiAmount = Math.round(order.amount * 100);
      return res.json({
        success: true,
        order_id: order.razorpay_order_id,
        amount: upiAmount,
        key_id: RAZORPAY_ID_KEY,
        DBOrderID: order._id,
      });
    } else {
      return res.json({
        success: false,
        message:
          "Retry payment option is not available for this order. Please try placing a new order.",
      });
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Retry Payment");
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
    const paymentMethod = req.query.method;
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
    let cart = await Cart.findOne({ customer_id: custID })
      .populate("cart_items.variant_id", "colour size")
      .populate(
        "cart_items.product_id",
        "price discount product_name product_images category"
      );

    //Finding deleted products or variants from items included in cart
    cart.cart_items.forEach((item) => {
      if (item.variant_id === null || item.product_id === null) {
        res.json({
          success: false,
          message:
            "One or more products have been deleted or disabled. Please try placing a new order.",
          redirectUrl: "/cart",
        });
      }
    });

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
    const amount = bill.grand_total;
    //Checking wallet balance
    if (paymentMethod === "wallet") {
      const wallet = await Wallet.findOne({ customer_id: custID });
      if (wallet.balance < amount) {
        return res.json({ success: false, message: "Insufficient balance." });
      }
    }
    if (amount >= 1000 && paymentMethod === "cod") {
      return res.json({
        success: false,
        message: "Cash on delivery is available only for payments below 1000.",
      });
    }
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
      let coupon_applied = {
        value: 0,
        is_percentage: false,
      };
      if (plainCart.coupon_id) {
        coupon_applied = {
          code: plainCart.coupon_id.code,
          value: plainCart.coupon_id.value,
          is_percentage: plainCart.coupon_id.is_percentage,
        };
      }
      let date = new Date();
      date.setDate(date.getDate() + 7);
      let paymentStatus;
      if (paymentMethod === "cod") {
        paymentStatus = "pending";
      } else if (paymentMethod === "wallet") {
        // updating wallet balance
        await Wallet.updateOne(
          { customer_id: custID },
          { $inc: { balance: -amount } }
        );
        paymentStatus = "completed";
      }
      const order = new Order({
        customer_id: custID,
        payment_type: paymentMethod,
        amount: amount,
        address: address,
        order_items: orderItems,
        delivery_date: date,
        payment_status: paymentStatus,
        coupon_applied: coupon_applied,
      });
      //Registering wallet transaction
      if (paymentMethod === "wallet") {
        await Wallet.updateOne(
          { customer_id: custID },
          {
            $push: {
              transaction_history: {
                order_id: order._id,
                amount: amount,
                transactionType: "debit",
              },
            },
          }
        );
        paymentStatus = "completed";
      }
      //Registering coupon use
      if (plainCart.coupon_id) {
        await CouponUses.insertMany([
          {
            coupon_id: plainCart.coupon_id?._id,
            code: plainCart.coupon_id?.code,
            customer_id: custID,
            order_id: order._id,
          },
        ]);
      }
      //clearing cart
      await Cart.updateOne(
        { customer_id: custID },
        { $set: { cart_items: [], coupon_id: null } }
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
    const order = await Order.findOne(
      {
        _id: orderID,
        "order_items.variant_id": variantID,
      },
      {
        "order_items.$": 1,
        coupon_applied: 1,
        amount: 1,
        customer_id: 1,
      }
    );
    const item = order.order_items[0];
    //checking if already cancelled
    if (item.product_status === "cancelled") {
      return res.json({
        success: false,
        message: "Product is cancelled already.",
      });
    }
    //update product status
    await Order.updateOne(
      {
        _id: orderID,
        "order_items.variant_id": variantID,
      },
      { $set: { "order_items.$.product_status": "cancelled" } }
    );
    let price = item.price;
    // handling coupon reduction in refund
    if (order.coupon_applied?.value) {
      if (order.coupon_applied.is_percentage) {
        price =
          Math.round(price * (1 - order.coupon_applied.value / 100) * 100) /
          100;
      } else {
        let couponPercentage =
          (order.amount / order.coupon_applied.value) * 100;
        price = Math.round(price * (1 - couponPercentage / 100) * 100) / 100;
      }
    }
    price *= item.quantity;
    //refund
    const transaction = {
      amount: price,
      transactionType: "credit",
    };
    await Wallet.updateOne(
      { customer_id: order.customer_id },
      {
        $inc: { balance: price },
        $push: { transaction_history: transaction },
      },
      { upsert: true }
    );
    await Order.updateOne(
      { _id: orderID },
      { $inc: { refunded_amount: price } }
    );
    //update stock
    await ProductVariant.updateOne(
      { _id: variantID },
      { $inc: { stock_quantity: item.quantity } }
    );
    //if all individuals items are cancelled set is_cancelled = true
    const notCancelled = await Order.aggregate([
      { $match: { _id: orderID } },
      { $unwind: "$order_items" },
      { $match: { "order_items.product_status": { $ne: "cancelled" } } },
      { $limit: 1 },
    ]);
    if (notCancelled.length === 0) {
      await Order.updateOne(
        { _id: orderID },
        {
          $set: {
            is_cancelled: true,
          },
        }
      );
    }
    return res.json({
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

    //re-stock
    order.order_items.forEach(async (item) => {
      await ProductVariant.updateOne(
        { _id: item.variant_id },
        { $inc: { stock_quantity: item.quantity } }
      );
    });
    if (order.is_cancelled) {
      return res.json({
        success: false,
        message: "Order is already cancelled.",
      });
    }
    //cancel order
    await Order.updateOne(
      { _id: orderID },
      {
        $set: {
          "order_items.$[].product_status": "cancelled",
          is_cancelled: true,
        },
      }
    );
    //refund
    let amount = 0;
    if (
      (order.payment_type === "razorpay" || order.payment_type === "wallet") &&
      order.payment_status === "completed"
    ) {
      amount = order.amount - order.refunded_amount;
      //crediting money
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
    await Order.updateOne(
      { _id: orderID },
      { $inc: { refunded_amount: amount } }
    );
    return res.json({
      success: true,
      message: "Order has been cancelled successfully.",
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Cancel Order");
  }
};

const getInvoice = async (req, res) => {
  try {
    const { orderID } = req.params;
    let data = {};
    const order = await Order.findById(orderID);
    // console.log(order);
    data.delivery_charge = 80;
    data.amount = order.amount.toFixed(2);
    data.address = order.address;
    data.order_id = order._id;
    data.billing_date = getDate(order.createdAt);
    data.payment_type = order.payment_type;
    data.payment_status = order.payment_status;
    data.delivery_date = getDate(order.delivery_date);
    data.order_items = order.order_items.map((value) => {
      const totalPrice = value.price * value.quantity;
      const og_price = (value.price / (1 - value.discount * 0.01)).toFixed(2);
      return {
        product_name: value.product_name,
        size: value.size,
        colour: value.colour,
        quantity: value.quantity,
        price: value.price.toFixed(2),
        discount: value.discount,
        og_price: og_price,
        total_price: totalPrice.toFixed(2),
      };
    });
    data.subtotal_amount = 0;
    data.total_amount = 0;
    data.coupon_discount = 0;
    data.order_items.forEach((item) => {
      data.subtotal_amount += Number(item.og_price * item.quantity);
      data.total_amount += Number(item.total_price);
    });
    data.total_discount = (
      -1 *
      (data.subtotal_amount - data.total_amount)
    ).toFixed(2);
    const appliedCoupon = order.coupon_applied;
    data.coupon_value = "";
    if (appliedCoupon) {
      if (appliedCoupon.is_percentage) {
        data.coupon_value = `${appliedCoupon.value}%`;
        data.coupon_discount = -(
          (appliedCoupon.value / 100) *
          data.total_amount
        );
      } else {
        data.coupon_value = `${appliedCoupon.value}`;
        data.coupon_discount -= appliedCoupon.value;
      }
    }
    data.saved_amount = (
      data.subtotal_amount +
      data.delivery_charge -
      data.amount
    ).toFixed(2);
    data.saved_percentage = (
      (data.saved_amount * 100) /
      (data.subtotal_amount + data.delivery_charge)
    ).toFixed(2);
    data.coupon_discount = data.coupon_discount.toFixed(2);
    data.subtotal_amount = data.subtotal_amount.toFixed(2);
    // console.log(data);
    res.json({ success: true, data: data });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Get Invoice");
  }
};

function getDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
}

module.exports = {
  checkout,
  applyCoupon,
  removeCoupon,
  refreshBill,
  createOrder,
  retryPayment,
  editPaymentStatus,
  placeOrder,
  ordersPage,
  cancelItem,
  cancelOrder,
  getInvoice,
};
