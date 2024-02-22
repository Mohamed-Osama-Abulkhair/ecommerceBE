import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      unique: [true, "product title is unique"],
      trim: true,
      required: [true, "product title is required"],
      minLength: [2, "too short product name"],
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    price: {
      type: Number,
      required: [true, "product price is required"],
      min: 0,
    },
    priceAfterDiscount: {
      type: Number,
      min: 0,
    },
    ratingAvg: {
      type: Number,
      min: [1, "rating average must be greater than zero"],
      max: [5, "rating average must be less than six"],
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
      required: [true, "product description is required"],
      minLength: [5, "too short product description"],
      maxLength: [300, "too short product description"],
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
      required: [true, "product quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
      min: 0,
    },
    imageCover: String,
    images: [String],
    category: {
      type: mongoose.Types.ObjectId,
      ref: "category",
      required: [true, "product category is required"],
    },
    subcategory: {
      type: mongoose.Types.ObjectId,
      ref: "subcategory",
      required: [true, "product subcategory is required"],
    },
    brand: {
      type: mongoose.Types.ObjectId,
      ref: "brand",
      required: [true, "product brand is required"],
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

productSchema.post("init", (doc) => {
  doc.imageCover = process.env.baseURL + "/product/" + doc.imageCover;
  if (doc.images)
    doc.images = doc.images.map(
      (image) => process.env.baseURL + "/product/" + image
    );
});

productSchema.virtual("productReviews", {
  ref: "review",
  localField: "_id",
  foreignField: "product",
});

productSchema.pre(/^find/, function () {
  this.populate("productReviews");
});

export const productModel = mongoose.model("product", productSchema);
