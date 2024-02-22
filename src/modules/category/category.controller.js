import { categoryModel } from "../../../databases/models/category.model.js";
import slugify from "slugify";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import * as factory from "../handlers/factory.handler.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";

// 1- add category
const addCategory = catchAsyncError(async (req, res, next) => {
  req.body.slug = slugify(req.body.name);
  req.body.image = req.file.filename;

  let result = new categoryModel(req.body);
  await result.save();

  res.status(201).json({ message: "success", result });
});

// 2- get all categories
const getAllCategories = catchAsyncError(async (req, res, next) => {
  let apiFeatures = new ApiFeatures(categoryModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  let result = await apiFeatures.mongooseQuery;

  res.status(200).json({ message: "success", page: apiFeatures.page, result });
});

// 3- get one category
const getCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let result = await categoryModel.findById(id);

  !result && next(new appError("category not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 4- update one category
const updateCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  req.body.slug = slugify(req.body.name);
  req.body.image = req.file.filename;

  // let founded = await categoryModel.find({ name });
  // if (founded) return next(new appError("category is already exists", 409));

  let result = await categoryModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  !result && next(new appError("category not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 5- delete one category
const deleteCategory = factory.deleteOne(categoryModel);

export {
  addCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
