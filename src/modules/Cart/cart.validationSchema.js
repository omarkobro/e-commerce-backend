import Joi from "joi";
import { generalValidationRule } from "../../utils/generalValidation.js";

export const addProductSchema = {
    body:Joi.object({
        productId: generalValidationRule.dbId.required(),
        quantity: Joi.number().min(1).required(),
    }),
}
export const DeleteProductSchema = {
    params:Joi.object({
        productId: generalValidationRule.dbId.required(),
    }),
}

