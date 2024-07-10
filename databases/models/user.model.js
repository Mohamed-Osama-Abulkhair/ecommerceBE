import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "user name required"],
      minLength: [3, "too short user name"],
      maxLength: [30, "too long user name"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "email required"],
      minLength: [5, "too short email"],
      maxLength: [100, "too long email"],
      unique: [true, "email must be unique"],
      lowercase: true,
      validate: {
        validator: function (value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: "Invalid email format.",
      },
    },
    password: {
      type: String,
      required: true,
      minLength: [8, "password must be greater than 7 characters"],
    },
    passwordChangedAt: Date,
    phone: {
      type: String,
      required: [true, "phone number required"],
    },

    profileImage: {
      id: { type: String },
      url: { type: String },
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    wishlist: [
      {
        type: mongoose.Types.ObjectId,
        ref: "product",
      },
    ],
    addresses: [
      {
        city: String,
        street: String,
        phone: String,
      },
    ],

    forgetPasswordOTP: {
      otp: Number,
      createdAt: Date,
    },

    passwordChangedAt: Date,
    emailChangedAt: Date,
    loginChangedAt: Date,

    ApplyCoupon: Date,
    getCoupon: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", function () {
  if (this.password)
    this.password = bcrypt.hashSync(this.password, Number(process.env.Round));
});

userSchema.pre("findOneAndUpdate", function () {
  if (this._update.password)
    this._update.password = bcrypt.hashSync(
      this._update.password,
      Number(process.env.Round)
    );
});

export const userModel = mongoose.model("user", userSchema);
