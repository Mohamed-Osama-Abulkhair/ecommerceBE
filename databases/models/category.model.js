import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "name is required"],
      trim: true,
      required: true,
      minLength: [3, "too short category name"],
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },

    navImages: [
      {
        id: { type: String },
        url: { type: String },
      },
    ],

    mainSliderImages: [
      {
        id: { type: String },
        url: { type: String },
      },
    ],

    cloudFolder: {
      type: String,
      unique: [true, "category folder is unique"],
      required: [true, "category folder is required"],
    },
  },
  { timestamps: true }
);

export const categoryModel = mongoose.model("category", categorySchema);
