import slugify from "slugify";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { subcategoryModel } from "../../../databases/models/subcategory.model.js";
import * as factory from "../handlers/factory.handler.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { categoryModel } from "../../../databases/models/category.model.js";
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloud.js";

// 1- add subcategory
const addSubcategory = catchAsyncError(async (req, res, next) => {
  const { name, category } = req.body;

  const isCategory = await categoryModel.findById(category);
  if (!isCategory) return next(new appError("category not found", 404));

  const subcategory = await subcategoryModel.findOne({ name });
  if (subcategory) return next(new appError("subcategory is exists", 409));

  let result;
  let sliderImages = [];

  if (req.files.sliderImages) {
    const cloudFolder = slugify(name) + "-" + nanoid();
    sliderImages = await factory.addImages(
      req.files.sliderImages,
      "subcategory",
      cloudFolder
    );

    result = new subcategoryModel({
      name,
      category,
      slug: slugify(name),
      sliderImages,
      cloudFolder,
    });
  } else {
    result = new subcategoryModel({ name, category, slug: slugify(name) });
  }

  await result.save();

  res.status(201).json({ message: "success", result });
});

// 2- get all subcategories
const getAllSubcategories = catchAsyncError(async (req, res, next) => {
  let filter = {};
  if (req.params.categoryId) {
    filter = { category: req.params.categoryId };
  }

  const apiFeatures = new ApiFeatures(subcategoryModel.find(filter), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalSubcategories = await subcategoryModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length && next(new appError("Not subcategories added yet", 404));

  apiFeatures.calculateTotalAndPages(totalSubcategories);
  result.length &&
    res.status(200).json({
      message: "success",
      totalSubcategories,
      metadata: apiFeatures.metadata,
      result,
    });
});

// 3- get one subcategory
const getSubcategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const result = await subcategoryModel.findById(id);

  !result && next(new appError("subcategory not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 4- update one subcategory
const updateSubcategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name, category } = req.body;

  const subcategory = await subcategoryModel.findById(id);
  if (!subcategory) return next(new appError("subcategory not found", 404));

  if (category) {
    const isCategory = await categoryModel.findById(category);
    if (!isCategory) return next(new appError("category not found", 404));
    subcategory.category = category;
  }

  if (name) {
    const isExist = await subcategoryModel.findOne({ name });
    if (isExist) return next(new appError("subcategory is exists", 409));
    subcategory.name = name;
    subcategory.slug = slugify(name);
  }

  if (req.files.sliderImages) {
    const sliderImagesIds = subcategory.sliderImages.map((image) => image.id);
    await cloudinary.api.delete_resources(sliderImagesIds);
    subcategory.sliderImages = await factory.addImages(
      req.files.sliderImages,
      "subcategory",
      subcategory.cloudFolder
    );
  }

  await subcategory.save();

  res.status(200).json({ message: "success", result: subcategory });
});

// 5- delete one subcategory
const deleteSubcategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const subcategory = await subcategoryModel.findByIdAndDelete(id);
  if (!subcategory) return next(new appError("subcategory not found", 404));

  if (subcategory.cloudFolder) {
    const sliderImagesIds = subcategory.sliderImages.map((image) => image.id);
    await cloudinary.api.delete_resources(sliderImagesIds);

    await cloudinary.api.delete_folder(
      `${process.env.CLOUD_FOLDER_NAME}/subcategory/${subcategory.cloudFolder}`
    );
  }

  res.status(200).json({ message: "success", result: subcategory });
});

export {
  addSubcategory,
  getAllSubcategories,
  getSubcategory,
  updateSubcategory,
  deleteSubcategory,
};
