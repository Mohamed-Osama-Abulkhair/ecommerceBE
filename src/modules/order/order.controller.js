import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { cartModel } from "../../../databases/models/cart.model.js";
import { productModel } from "../../../databases/models/product.model.js";
import { orderModel } from "../../../databases/models/order.model.js";
import Stripe from "stripe";
import { userModel } from "../../../databases/models/user.model.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";

// 1- create Cash Order
const createCashOrder = catchAsyncError(async (req, res, next) => {
  const cart = await cartModel.findById(req.params.id);
  if (!cart) return next(new appError("cart not found", 404));
  const totalOrderPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;

  const order = new orderModel({
    user: req.user._id,
    orderItems: cart.cartItems,
    totalOrderPrice,
    orderDiscount: cart.discount + " %",
    shippingAddress: req.body.shippingAddress,
  });
  await order.save();

  if (order) {
    let options = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
      },
    }));
    await productModel.bulkWrite(options);
    await cartModel.findByIdAndDelete(req.params.id);

    return res.status(201).json({ message: "success", order });
  } else {
    return next(new appError("Error creating cart", 404));
  }
});

const getSpecificOrder = catchAsyncError(async (req, res, next) => {
  const order = await orderModel
    .find({ user: req.user._id })
    .populate("orderItems.product");

  !order.length && next(new appError("orders not found", 401));
  order.length && res.status(200).json({ message: "success", order });
});

const getAllOrders = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(
    orderModel.find().populate("orderItems.product"),
    req.query
  )
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery;

  !result.length && next(new appError("Not orders added yet", 404));
  result.length &&
    res
      .status(200)
      .json({ message: "success", page: apiFeatures.page, result });
});

const createCheckOutSession = catchAsyncError(async (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE_KEY);

  const cart = await cartModel.findById(req.params.id);
  if (!cart) return next(new appError("cart not found", 404));
  const totalOrderPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;

  let session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          unit_amount: totalOrderPrice.toFixed(0) * 100,
          product_data: {
            name: req.user.name,
          },
        },
        quantity: 1,
      },
    ],
    payment_method_types: ["card"],
    mode: "payment",
    success_url: process.env.SUCCESSFUL_URL,
    cancel_url: process.env.CANCEL_URL,
    customer_email: req.user.email,
    client_reference_id: req.params.id,
    metadata: req.body.shippingAddress,
  });
  res.status(200).json({ message: "success", session });
});

const createOnlineOrder = catchAsyncError(async (request, response, next) => {
  const stripe = new Stripe(process.env.STRIPE_KEY);
  const sig = request.headers["stripe-signature"].toString();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.ENDPOINT_SECRET
    );
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type == "checkout.session.completed") {
    console.log(event.data.object);
    return await handleCheckoutEvent(event.data.object, response);
  }

  return next(new appError("paid not completed", 404));
});

async function handleCheckoutEvent(e, res) {
  const cart = await cartModel.findById(e.client_reference_id);
  if (!cart) return next(new appError("cart not found", 404));

  const user = await userModel.findOne({ email: e.customer_email });

  const order = new orderModel({
    user: user._id,
    orderItems: cart.cartItems,
    totalOrderPrice: e.amount_total / 100,
    shippingAddress: e.metadata.shippingAddress,
    paymentMethod: "card",
    isPaid: true,
    paidAt: Date.now(),
  });
  await order.save();

  if (order) {
    let options = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
      },
    }));
    await productModel.bulkWrite(options);
    await cartModel.findByIdAndDelete({ user: user._id });

    return res.status(201).json({ message: "success", order });
  } else {
    return next(new appError("Error creating order", 404));
  }
}

export {
  createCashOrder,
  getSpecificOrder,
  getAllOrders,
  createCheckOutSession,
  createOnlineOrder,
};
