import Joi from "joi";
import { generalValidationRule } from "../../utils/generalValidation.js";

export const addBrandSchema = {
    body:Joi.object({
        brandName: Joi.string().required(),
    }),
    query:Joi.object({
        categoryId: generalValidationRule.dbId.required(),
        subCategoryId: generalValidationRule.dbId.required(),
})
}

export const updateBrandSchema = {
    body:Joi.object({
        brandName: Joi.string().optional(),
        oldPublicId: Joi.string().optional()
    }),
    params:Joi.object({
        brandId: generalValidationRule.dbId.required(),

})
}
export const deleteBrandSchema = {
    params:Joi.object({
        brandId: generalValidationRule.dbId.required(),
})
}

