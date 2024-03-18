import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      unique: [true, "product title is unique"],
      trim: true,
      required: [true, "product title is required"],
      minLength: [3, "too short product title"],
      maxLength: [150, "too short product title"],
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
    discount: {
      type: Number,
      min: 1,
      max: 100,
    },

    // priceAfterDiscount: {
    //   type: Number,
    //   min: 0,
    // },
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
      minLength: [10, "too short product description"],
      maxLength: [700, "too long product description"],
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
    imageCover: {
      id: { type: String, required: true },
      url: { type: String, required: true },
    },
    images: [
      {
        id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    cloudFolder: {
      type: String,
      unique: [true, "product folder is unique"],
      required: [true, "product folder is required"],
    },
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
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual("finalPrice").get(function () {
  return Math.ceil(this.price - (this.price * this.discount || 0) / 100) - 0.01;
});

productSchema.virtual("productReviews", {
  ref: "review",
  localField: "_id",
  foreignField: "product",
});

productSchema.pre(/^find/, function () {
  this.populate("productReviews");
});

productSchema.pre("save", function () {
  this.price = Math.ceil(this.price) - 0.01;
});

export const productModel = mongoose.model("product", productSchema);
