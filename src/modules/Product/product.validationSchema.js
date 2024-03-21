import Joi from "joi";
import { generalValidationRule } from "../../utils/generalValidation.js";

export const addProductSchema = {
    body:Joi.object({
        title: Joi.string().optional(),
        description: Joi.string(),
        basePrice: Joi.number().optional(),
        discount: Joi.number().default(0),
        stock: Joi.number().min(0).default(0).optional(),
    }),

    params:Joi.object({
        brandId: generalValidationRule.dbId.optional(),
        subCategoryId: generalValidationRule.dbId.optional(),
        categoryId: generalValidationRule.dbId.optional(),})
}

export const updateProductSchema = {
    body:Joi.object({
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        specs: Joi.object().optional(),
        stock: Joi.number().integer().min(0).optional(),
        basePrice: Joi.number().min(0).optional(),
        discount: Joi.number().min(0).max(100).optional(),
        oldPublicId: Joi.string().optional()
    }),

    params:Joi.object({
        productId: generalValidationRule.dbId.required()
})
}
