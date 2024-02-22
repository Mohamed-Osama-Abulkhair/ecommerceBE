import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { cartModel } from "../../../databases/models/cart.model.js";
import { productModel } from "../../../databases/models/product.model.js";
import { orderModel } from "../../../databases/models/order.model.js";
import Stripe from "stripe";
import { userModel } from "../../../databases/models/user.model.js";

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
  let order = await orderModel
    .findOne({ user: req.user._id })
    .populate("orderItems.product");

  !order && next(new appError("order not found", 401));
  order && res.status(200).json({ message: "success", order });
});

const getAllOrders = catchAsyncError(async (req, res, next) => {
  let orders = await orderModel.find({}).populate("orderItems.product");

  !orders.length && next(new appError("order not found", 401));
  orders.length && res.status(200).json({ message: "success", orders });
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
          unit_amount: totalOrderPrice * 100,
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

const createOnlineOrder = catchAsyncError((request, response) => {
  const sig = request.headers["stripe-signature"].toString();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      "whsec_k3tsOw0sboEpBQzy1hstH9MtBKeXpTPG"
    );
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type == "checkout.session.completed") {
    const checkoutSessionCompleted = event.data.object;
    console.log("order online");
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }
});

async function card(e, res) {
  const cart = await cartModel.findById(e.client_reference_id);
  if (!cart) return next(new appError("cart not found", 404));

  let user = await userModel.findOne({ email: e.customer_email });

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
    return next(new appError("Error creating cart", 404));
  }
}

export {
  createCashOrder,
  getSpecificOrder,
  getAllOrders,
  createCheckOutSession,
  createOnlineOrder,
};
