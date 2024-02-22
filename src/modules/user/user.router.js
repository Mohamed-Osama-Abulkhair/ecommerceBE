import express from "express";
import * as userController from "./user.controller.js";
import { validation } from "../../middleware/validation.js";
import {
  changePasswordSchema,
  createUserSchema,
  getUserSchema,
  loginSchema,
  updateUserSchema,
} from "./user.validation.js";
import { authorization, protectRoutes } from "../auth/auth.js";

const userRouter = express.Router();

userRouter
  .route("/")
  .post(validation(createUserSchema), userController.addUser)
  .get(userController.getAllUsers);

userRouter.get("/signUpVerify/:token", userController.verifySignUP);

userRouter.post("/signIn", validation(loginSchema), userController.signIn);

userRouter
  .route("/:id")
  .get(validation(getUserSchema), userController.getUser)
  .put(
    validation(updateUserSchema),
    protectRoutes,
    authorization,
    userController.updateUser
  )
  .delete(
    validation(getUserSchema),
    protectRoutes,
    authorization,
    userController.deleteUser
  );

userRouter.patch(
  "/changeUserPassword/:id",
  validation(changePasswordSchema),
  protectRoutes,
  authorization,
  userController.changeUserPassword
);

userRouter.get(
  "/logOut/:id",
  validation(getUserSchema),
  protectRoutes,
  authorization,
  userController.logOut
);

export default userRouter;
