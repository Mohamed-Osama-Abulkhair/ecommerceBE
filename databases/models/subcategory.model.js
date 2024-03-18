import mongoose from "mongoose";

const subcategorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "name is required"],
      trim: true,
      required: true,
      minLength: [3, "too short subcategory name"],
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "category",
    },
    sliderImages: [
      {
        id: { type: String },
        url: { type: String },
      },
    ],  
    cloudFolder: {
      type: String,
      unique: [true, "category folder is unique"],
    },
  },
  { timestamps: true }
);

export const subcategoryModel = mongoose.model(
  "subcategory",
  subcategorySchema
);
