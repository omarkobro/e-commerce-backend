import Joi from "joi";
import { generalValidationRule } from "../../utils/generalValidation.js";

export const addSubCategorySchema = {
    body:Joi.object({
        subCategoryName: Joi.string().min(2).max(300).optional(),
    }),
    params:Joi.object({
        categoryId: generalValidationRule.dbId.required(),
})
}

export const deleteSubCategorySchema = {
    params:Joi.object({
        subCategoryId: generalValidationRule.dbId.required(),
})
}
export const SgetSubCategoryByIdSchema = {
    params:Joi.object({
        subCategoryId: generalValidationRule.dbId.required(),
})
}
export const getBrandsForSubCategorySchema = {
    params:Joi.object({
        subCategoryId: generalValidationRule.dbId.required(),
})
}
