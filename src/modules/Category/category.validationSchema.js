import Joi from "joi";
import { generalValidationRule } from "../../utils/generalValidation.js";

export let addCategorySchema = {
    body:Joi.object({
        categoryName: Joi.string().optional(),//???????
    }),
}

export let updateCategorySchema = {
    body:Joi.object({
        categoryName: Joi.string().optional(),
        oldPublicId: Joi.string().optional(),
    }),
    params:Joi.object({
        categoryId: generalValidationRule.dbId.required(),
})
}


export let deleteCategorySchema = {
    params:Joi.object({
        categoryId: generalValidationRule.dbId.required(),
})
}



