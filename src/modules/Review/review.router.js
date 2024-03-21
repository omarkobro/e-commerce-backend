import * as reviewController from "./review.controller.js"
import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import expressAsyncHandler from "express-async-handler";
import { reviewPrivileges } from "./review.prievileges.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { addReviewSchema, deleteReviewSchema, getReviews } from "./review.validationSchemas.js";

let router = Router()

router.post("/addReview/:productId",validationMiddleware(addReviewSchema), auth(reviewPrivileges.ADD_REVIEW),expressAsyncHandler(reviewController.addReview))
router.delete("/deleteReview/:reviewId",validationMiddleware(deleteReviewSchema), auth(reviewPrivileges.DELETE_REVIEW),expressAsyncHandler(reviewController.deleteReview))
router.get("/getReviewsForProduct/:productId",validationMiddleware(getReviews),expressAsyncHandler(reviewController.getReviewsForProduct))

export default router