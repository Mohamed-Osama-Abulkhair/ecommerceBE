import slugify from "slugify";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { subcategoryModel } from "../../../databases/models/subcategory.model.js";
import * as factory from "../handlers/factory.handler.js";

// 1- add subcategory
const addSubcategory = catchAsyncError(async (req, res, next) => {
  const { name, category } = req.body;

  let result = new subcategoryModel({ name, category, slug: slugify(name) });
  await result.save();

  res.status(201).json({ message: "success", result });
});

// 2- get all subcategories
const getAllSubcategories = catchAsyncError(async (req, res, next) => {
  let filter = {};
  if (req.params.categoryId) {
    filter = { category: req.params.categoryId };
  }

  let result = await subcategoryModel.find(filter);

  res.status(200).json({ message: "success", result });
});

// 3- get one subcategory
const getSubcategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let result = await subcategoryModel.findById(id);

  !result && next(new appError("subcategory not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 4- update one subcategory
const updateSubcategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name, category } = req.body;

  let result = await subcategoryModel.findByIdAndUpdate(
    id,
    {
      name,
      category,
      slug: slugify(name),
    },
    { new: true }
  );

  !result && next(new appError("subcategory not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 5- delete one subcategory
const deleteSubcategory = factory.deleteOne(subcategoryModel);

export {
  addSubcategory,
  getAllSubcategories,
  getSubcategory,
  updateSubcategory,
  deleteSubcategory,
};
