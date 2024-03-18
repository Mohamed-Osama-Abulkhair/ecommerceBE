import { categoryModel } from "../../../databases/models/category.model.js";
import slugify from "slugify";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { ApiFeatures, shuffleArray } from "../../utils/ApiFeatures.js";
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloud.js";
import * as factory from "../handlers/factory.handler.js";

// 1- add category
const addCategory = catchAsyncError(async (req, res, next) => {
  if (!req.files.navImages || !req.files.mainSliderImages)
    return next(new appError("All Category images are required", 400));

  const { name } = req.body;
  const founded = await categoryModel.findOne({ name });
  if (founded)
    return next(new appError("category name is already exists", 409));

  const cloudFolder = slugify(name) + "-" + nanoid();

  const [navImages, mainSliderImages] = await Promise.all([
    factory.addImages(req.files.navImages, "category", cloudFolder),
    factory.addImages(req.files.mainSliderImages, "category", cloudFolder),
  ]);

  const result = new categoryModel({
    name,
    slug: slugify(name),
    navImages,
    mainSliderImages,
    cloudFolder,
  });
  await result.save();

  res.status(201).json({ message: "success", result });
});

// 2- get all categories
const getAllCategories = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(categoryModel.find(), req.query)
  .paginate()
  .filter()
  .sort()
  .search()
  .fields();

const result = await apiFeatures.mongooseQuery.exec();

const totalCategories = await categoryModel.countDocuments(
  apiFeatures.mongooseQuery._conditions
);

!result.length && next(new appError("Not categories added yet", 404));

apiFeatures.calculateTotalAndPages(totalCategories);
result.length &&
  res.status(200).json({
    message: "success",
    totalCategories,
    metadata: apiFeatures.metadata,
    result,
  });
});

// 3- get one category
const getCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const result = await categoryModel.findById(id);

  !result && next(new appError("category not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 4- update one category
const updateCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const category = await categoryModel.findById(id);
  if (!category) return next(new appError("category not found", 404));

  if (req.body.name) {
    const founded = await categoryModel.findOne({ name: req.body.name });
    if (founded)
      return next(new appError("category name is already exists", 409));
    category.name = req.body.name;
    category.slug = slugify(req.body.name);
  }

  if (req.files.navImages) {
    const navImagesIds = category.navImages.map((image) => image.id);
    await cloudinary.api.delete_resources(navImagesIds);
    category.navImages = await factory.addImages(
      req.files.navImages,
      "category",
      category.cloudFolder
    );
  }

  if (req.files.mainSliderImages) {
    const mainSliderImagesIds = category.mainSliderImages.map(
      (image) => image.id
    );
    await cloudinary.api.delete_resources(mainSliderImagesIds);
    category.mainSliderImages = await factory.addImages(
      req.files.mainSliderImages,
      "category",
      category.cloudFolder
    );
  }

  await category.save();

  res.status(200).json({ message: "success", result: category });
});

// 5- delete one category
const deleteCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const category = await categoryModel.findByIdAndDelete(id);
  if (!category) return next(new appError("category not found", 404));

  const navImagesIds = category.navImages.map((image) => image.id);
  const mainSliderImagesIds = category.mainSliderImages.map(
    (image) => image.id
  );
  const allImagesIds = [...navImagesIds, ...mainSliderImagesIds];

  await cloudinary.api.delete_resources(allImagesIds);
  await cloudinary.api.delete_folder(
    `${process.env.CLOUD_FOLDER_NAME}/category/${category.cloudFolder}`
  );

  res.status(200).json({ message: "success", result: category });
});

export {
  addCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
