import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "user name required"],
      minLength: [3, "too short user name"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "email required"],
      minLength: [3, "too short email"],
      unique: [true, "email must be unique"],
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minLength: [3, "minlength must be greater than 2 characters"],
    },
    passwordChangedAt: Date,
    phone: {
      type: String,
      required: [true, "phone number required"],
    },
    // profilePic: {
    //   type: String,
    // },
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
  },
  { timestamps: true }
);

userSchema.pre("save", function () {
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
