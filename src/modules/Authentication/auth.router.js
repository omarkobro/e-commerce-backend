import { Router } from "express";
import * as authController from "./auth.controller.js"
import expressAsyncHandler from "express-async-handler";
import { LoginSchema,ResetPassword,UpdatePassword,forgetPassword,signUpSchema } from "./auth.validationSchema.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { authPrievilges } from "./auth.privileges.js";


let router = Router();

router.post("/signUp", validationMiddleware(signUpSchema), expressAsyncHandler(authController.signUp))
router.post("/login", validationMiddleware(LoginSchema), expressAsyncHandler(authController.login))
router.get('/verifyEmail' ,expressAsyncHandler(authController.verifyEmail))
router.post("/forgetPassword",validationMiddleware(forgetPassword), expressAsyncHandler(authController.forgetPassword))
router.post("/resetPassword",validationMiddleware(ResetPassword), expressAsyncHandler(authController.resetPassword))
router.post("/updatePassword",auth(authPrievilges.FORGET_PASSWORD), validationMiddleware(UpdatePassword), expressAsyncHandler(authController.UpdatePassword))
export default router