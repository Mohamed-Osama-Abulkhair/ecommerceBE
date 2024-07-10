import { userModel } from "../../../databases/models/user.model.js";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import * as factory from "../handlers/factory.handler.js";
import { sendEmail } from "../../utils/emails/verify.email.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import cloudinary from "../../utils/cloud.js";

// 1- add user
const addUser = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findOne({ email: req.body.email });
  if (user) return next(new appError("Email already exists", 409));

  if (req.user) req.body.role = "admin";

  const result = new userModel(req.body);
  await result.save();

  sendEmail({
    email: req.body.email,
    message: "Confirm Sign Up ✔",
    title: "Confirm Your Email Address ",
    btnMessage: "Confirm",
    verifyType: "signUpVerify",
  });

  res.status(201).json({ message: "success" });
});

// verify Email
const verifySignUP = async (req, res, next) => {
  const { token } = req.params;
  if (!token) return next(new appError("token not provided", 498));

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_secretKey);
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new appError("invalid token", 401));
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  const user = await userModel.findOne({ email: decoded.email });
  if (!user) return next(new appError("invalid token", 498));

  const result = await userModel.findOneAndUpdate(
    { email: decoded.email },
    { verified: true },
    { new: true }
  );
  res.status(201).json({ message: "success", result });
};

// 2- sign In

const signIn = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) return next(new appError("incorrect email or password", 401));
  const match = await bcrypt.compare(password, user.password);

  if (match) {
    const token = jwt.sign(
      { name: user.name, userId: user._id, role: user.role },
      process.env.JWT_secretKey
    );

    user.isActive = true;
    await user.save();
    return res.json({ message: "success", token });
  }
  next(new appError("incorrect email or password", 401));
});

// 3- get all users
const getAllUsers = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(userModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalProducts = await userModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length && next(new appError("Not users added yet", 404));

  apiFeatures.calculateTotalAndPages(totalProducts);
  result.length &&
    res.status(200).json({
      message: "success",
      totalProducts,
      metadata: apiFeatures.metadata,
      result,
    });
});

// 4- get one user
const getUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const result = await userModel.findById(id);
  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 5- update one user
const updateUser = catchAsyncError(async (req, res, next) => {
  let result;

  if (req.body.email) {
    const existsData = await userModel.findOne({
      email: req.body.email,
    });

    if (existsData)
      return next(new appError("Email already belongs to another user", 409));

    result = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        ...req.body,
        isActive: false,
        verified: false,
        emailChangedAt: Date.now(),
      },
      { new: true }
    );

    sendEmail({
      email: req.body.email,
      message: "Confirm Changed Email ✔",
      title: "Confirm Your Email Address ",
      btnMessage: "Confirm",
      verifyType: "signUpVerify",
    });
  } else {
    result = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        ...req.body,
      },
      { new: true }
    );
  }

  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 6- change user password
const changeUserPassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const match = await bcrypt.compare(oldPassword, req.user.password);
  if (!match) return next(new appError("incorrect password", 401));

  const result = await userModel.findByIdAndUpdate(
    req.user._id,
    { password: newPassword, passwordChangedAt: Date.now() },
    { new: true }
  );
  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 7- delete one user
const deleteUser = factory.deleteOne(userModel);

//8- upload user profile Image
const uploadProfileImage = catchAsyncError(async (req, res, next) => {
  if (!req.file) return next(new appError(" profile image is required", 400));

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/user`,
    }
  );

  if (req.user.profileImage)
    await cloudinary.api.delete_resources(req.user.profileImage.id);

  const result = await userModel.findByIdAndUpdate(
    req.user._id,
    { profileImage: { id: public_id, url: secure_url } },
    { new: true }
  );
  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 9- Forget password
const forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) return next(new appError("user not found", 404));

  // Generate a secure OTP (e.g., a 6-digit number)
  const OTP = Math.floor(100000 + Math.random() * 900000);

  const forgetPasswordOTPInstance = {
    otp: OTP,
    createdAt: Date.now(),
  };

  const result = await userModel.findOneAndUpdate(
    { email },
    { forgetPasswordOTP: forgetPasswordOTPInstance },
    { new: true }
  );
  sendEmail({
    email,
    message: "Reset Your Password ✔",
    title: "Your OTP code",
    btnMessage: `${OTP}`,
    verifyType: "forgetPasswordVerify",
  });

  res.status(201).json({ message: "success", result });
});

// verify Forget Password
const verifyForgetPassword = async (req, res, next) => {
  const { email, newPassword, otpCode } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) return next(new appError("user not found", 404));

  const otpExpirationTime = 300000; // 5 minutes in milliseconds

  if (
    otpCode != user.forgetPasswordOTP.otp ||
    Date.now() - user.forgetPasswordOTP.createdAt.getTime() > otpExpirationTime
  )
    return next(new appError("wrong email or invalid , expired OTP", 401));

  const forgetPasswordOTP = {
    createdAt: user.forgetPasswordOTP.createdAt.getTime() - 300000,
  };

  const result = await userModel.findOneAndUpdate(
    { email },
    {
      password: newPassword,
      isActive: false,
      passwordChangedAt: Date.now(),
      forgetPasswordOTP,
    },
    { new: true }
  );
  res.status(201).json({ message: "Success", result });
};

//11- log out
const logOut = catchAsyncError(async (req, res, next) => {
  const result = await userModel.findByIdAndUpdate(
    req.user._id,
    { isActive: false, loginChangedAt: Date.now() },
    { new: true }
  );
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
  uploadProfileImage,
  forgetPassword,
  verifyForgetPassword,
  logOut,
};
