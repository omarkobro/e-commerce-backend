import { Router } from "express";
import * as authController from "./auth.controller.js"
import expressAsyncHandler from "express-async-handler";
import { LoginSchema,signUpSchema } from "./auth.validationSchema.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";


let router = Router();

router.post("/signUp", validationMiddleware(signUpSchema), expressAsyncHandler(authController.signUp))
router.post("/login", validationMiddleware(LoginSchema), expressAsyncHandler(authController.login))
router.get('/verifyEmail' , expressAsyncHandler(authController.verifyEmail))

export default router