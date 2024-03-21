import Joi from "joi";
import { generalValidationRule } from "../../utils/generalValidation.js";

export const addReviewSchema = {
    body:Joi.object({
        reviewRate: Joi.number().required().min(1).max(5),
        reviewComment: Joi.string().min(2).max(300).optional(),
    }),
    params:Joi.object({
        productId: generalValidationRule.dbId.required(),
})
}

export const deleteReviewSchema = {
    params:Joi.object({
        reviewId: generalValidationRule.dbId.required(),
})
}
export const getReviews = {
    params:Joi.object({
        productId: generalValidationRule.dbId.required(),
})
} 