import slugify from "slugify";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { brandModel } from "../../../databases/models/brand.model.js";
import * as factory from "../handlers/factory.handler.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";

// 1- add brand
const addBrand = catchAsyncError(async (req, res, next) => {
  req.body.slug = slugify(req.body.name);
  req.body.logo = req.file.filename;
  let result = new brandModel(req.body);
  await result.save();

  res.status(201).json({ message: "success", result });
});

// 2- get all Brands
const getAllBrands = catchAsyncError(async (req, res, next) => {
  let apiFeatures = new ApiFeatures(brandModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  let result = await apiFeatures.mongooseQuery;

  res.status(200).json({ message: "success", page: apiFeatures.page, result });
});

// 3- get one brand
const getBrand = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let result = await brandModel.findById(id);

  !result && next(new appError("brand not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 4- update one brand
const updateBrand = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  req.body.slug = slugify(req.body.name);
  req.body.logo = req.file.filename;

  let result = await brandModel.findByIdAndUpdate(id, req.body, { new: true });

  !result && next(new appError("brand not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 5- delete one brand
const deleteBrand = factory.deleteOne(brandModel);

export { addBrand, getAllBrands, getBrand, updateBrand, deleteBrand };
