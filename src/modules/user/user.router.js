import express from "express";
import * as userController from "./user.controller.js";
import { validation } from "../../middleware/validation.js";
import {
  changePasswordSchema,
  createUserSchema,
  forgetPasswordSchema,
  getUserSchema,
  loginSchema,
  updateUserSchema,
  verForgetPasswordSchema,
} from "./user.validation.js";
import {
  allowedTo,
  authorization,
  isConfirmed,
  protectRoutes,
} from "../auth/auth.js";
import { fileUpload } from "../../middleware/fileUpload.js";

const userRouter = express.Router();

userRouter
  .route("/")
  .post(validation(createUserSchema), userController.addUser)
  .get(userController.getAllUsers);

userRouter.get("/signUpVerify/:token", userController.verifySignUP);

userRouter.post("/signIn", validation(loginSchema), userController.signIn);

userRouter.post(
  "/admin",
  protectRoutes,
  allowedTo("admin"),
  isConfirmed,
  validation(createUserSchema),
  userController.addUser
);

userRouter
  .route("/:id")
  .get(validation(getUserSchema), userController.getUser)
  .put(
    protectRoutes,
    authorization,
    validation(updateUserSchema),
    userController.updateUser
  )
  .delete(
    protectRoutes,
    authorization,
    validation(getUserSchema),
    userController.deleteUser
  );

userRouter.patch(
  "/changeUserPassword/:id",
  protectRoutes,
  authorization,
  isConfirmed,
  validation(changePasswordSchema),
  userController.changeUserPassword
);

userRouter.post(
  "/uploadProfileImage/:id",
  protectRoutes,
  authorization,
  isConfirmed,
  fileUpload().single("profileImage"),
  validation(getUserSchema),
  userController.uploadProfileImage
);

userRouter.post(
  "/forgetPassword",
  validation(forgetPasswordSchema),
  userController.forgetPassword
);

userRouter.patch(
  "/forgetPasswordVerify",
  validation(verForgetPasswordSchema),
  userController.verifyForgetPassword
);

userRouter.get(
  "/logOut/:id",
  protectRoutes,
  authorization,
  validation(getUserSchema),
  userController.logOut
);

export default userRouter;
