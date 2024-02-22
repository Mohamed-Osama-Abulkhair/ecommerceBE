import slugify from "slugify";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { productModel } from "../../../databases/models/product.model.js";
import * as factory from "../handlers/factory.handler.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";

// 1- add product
const addProduct = catchAsyncError(async (req, res, next) => {
  console.log(req.files)
  req.body.slug = slugify(req.body.title);
  req.body.imageCover = req.files.imageCover[0].filename;
  req.body.images = req.files.images.map((obj) => obj.filename);

  let result = new productModel(req.body);
  await result.save();

  res.json({ message: "success", result });
});

// 2- get all products
const getAllProducts = catchAsyncError(async (req, res, next) => {
  let apiFeatures = new ApiFeatures(productModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  // __ execute query __
  let result = await apiFeatures.mongooseQuery;
  res.json({ message: "success", page: apiFeatures.page, result });
});

// 3- get one product
const getProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let result = await productModel.findById(id);

  !result && next(new appError("product not found", 404));
  result && res.json({ message: "success", result });
});

// 4- update one product
const updateProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.title) req.body.slug = slugify(req.body.title);

  let result = await productModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  !result && next(new appError("product not found", 404));
  result && res.json({ message: "success", result });
});

// 5- delete one product
const deleteProduct = factory.deleteOne(productModel);

export { addProduct, getAllProducts, getProduct, updateProduct, deleteProduct };
