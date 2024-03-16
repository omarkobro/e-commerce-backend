import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import { couponEndPoints } from "./coupon.priveliges.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { addCouponSchema } from "./coupon.validationSchemas.js";
import expressAsyncHandler from "express-async-handler";
import * as couponController from "./coupon.controller.js"
let router = Router()

router.post("/addCoupon", auth(couponEndPoints.ADD_COUPOUN), validationMiddleware(addCouponSchema), expressAsyncHandler(couponController.addCoupon))
router.post("/testCoupon", auth(couponEndPoints.ADD_COUPOUN), expressAsyncHandler(couponController.testCoupon) )
export default router