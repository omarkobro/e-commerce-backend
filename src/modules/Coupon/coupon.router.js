import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import { couponEndPoints } from "./coupon.priveliges.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { addCouponSchema, enableAndDisableSchema, getCouponByIdSchema } from "./coupon.validationSchemas.js";
import expressAsyncHandler from "express-async-handler";
import * as couponController from "./coupon.controller.js"
let router = Router()
router.post("/addCoupon", auth(couponEndPoints.COUPOUN_RULE), validationMiddleware(addCouponSchema), expressAsyncHandler(couponController.addCoupon))
router.put("/updateCoupon/:couponId",auth(couponEndPoints.COUPOUN_RULE), expressAsyncHandler(couponController.updateCoupon))
router.post("/EnableAndDisableCoupon",validationMiddleware(enableAndDisableSchema), auth(couponEndPoints.COUPOUN_RULE), expressAsyncHandler(couponController.toggleEnableDisableCoupon))
router.get("/getAllDisabledCoupons", expressAsyncHandler(couponController.getAllDisabeldCoupons))
router.get("/getAllEnabledCoupons", expressAsyncHandler(couponController.getAllEnabledCoupons))
router.get("/getAllCoupons", expressAsyncHandler(couponController.getAllCoupons))
router.get("/getCouponById/:couponId",validationMiddleware(getCouponByIdSchema), expressAsyncHandler(couponController.getCouponById))
export default router