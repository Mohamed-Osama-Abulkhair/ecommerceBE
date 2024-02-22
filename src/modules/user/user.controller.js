import { userModel } from "../../../databases/models/user.model.js";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import * as factory from "../handlers/factory.handler.js";
import { sendEmail } from "../../utils/emails/verify.email.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 1- add user
const addUser = catchAsyncError(async (req, res, next) => {
  let user = await userModel.findOne({ email: req.body.email });
  if (user) return next(new appError("Email already exists", 409));

  let result = new userModel(req.body);
  await result.save();

  sendEmail({
    email: req.body.email,
    message: "Confirm Sign Up ✔",
    title: "Confirm Your Email Address ",
    btnMessage: "Confirm",
    verifyType: "signUpVerify",
  });

  res.status(201).json({ message: "success", result });
});

// verify Email
const verifySignUP = async (req, res, next) => {
  const { token } = req.params;
  if (!token) return next(new appError("token not provided", 498));

  let decoded = jwt.verify(token, process.env.JWT_secretKey);
  let user = await userModel.findOne({ email: decoded.email });
  if (!user) return next(new appError("invalid token", 498));

  let result = await userModel.findOneAndUpdate(
    { email: decoded.email },
    { verified: true },
    { new: true }
  );

  res.status(201).json({ message: "success", result });
};

// 2- sign In

const signIn = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  let user = await userModel.findOne({ email });
  if (!user) return next(new appError("incorrect email or password", 401));
  const match = await bcrypt.compare(password, user.password);

  if (user && match) {
    let token = jwt.sign(
      { name: user.name, userId: user._id, role: user.role },
      process.env.JWT_secretKey
    );

    user = await userModel.findOneAndUpdate(
      { email },
      { isActive: true },
      { new: true }
    );
    return res.json({ message: "success", token });
  }
  next(new appError("incorrect email or password", 401));
});

// 3- get all users
const getAllUsers = catchAsyncError(async (req, res, next) => {
  let result = await userModel.find({});

  res.status(200).json({ message: "success", result });
});

// 4- get one user
const getUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let result = await userModel.findById(id);

  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 5- update one user
const updateUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let existsData = await userModel.findOne({
    email: req.body.email,
  });

  if (existsData)
    return next(new appError("Email already belongs to another user", 409));

  let result = await userModel.findByIdAndUpdate(id, req.body, { new: true });

  if (req.body.email) {
    result = await userModel.findByIdAndUpdate(
      id,
      { verified: false },
      { new: true }
    );
  }

  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 6- change user password
const changeUserPassword = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  req.body.passwordChangedAt = Date.now();
  let result = await userModel.findByIdAndUpdate(id, req.body, { new: true });

  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 7- delete one user
const deleteUser = factory.deleteOne(userModel);

//8- update one user
const logOut = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let result = await userModel.findByIdAndUpdate(id, {isActive: false}, { new: true });
  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success", result });
});

export {
  addUser,
  verifySignUP,
  signIn,
  getAllUsers,
  getUser,
  updateUser,
  changeUserPassword,
  deleteUser,
  logOut,
};
