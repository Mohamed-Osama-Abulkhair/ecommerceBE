import mongoose from "mongoose";

const brandSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "name is required"],
      trim: true,
      required: true,
      minLength: [3, "too short brand name"],
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    logo: {
      type: String,
    },
  },
  { timestamps: true }
);

brandSchema.post("init", (doc) => {
  doc.logo = process.env.baseURL + "/brand/" + doc.logo;
}); 

export const brandModel = mongoose.model("brand", brandSchema);
