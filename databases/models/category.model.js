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
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

categorySchema.post("init", (doc) => {
  doc.image = process.env.baseURL + "/category/" + doc.image;
}); 

export const categoryModel = mongoose.model("category", categorySchema);
