import Joi from "joi";
import { generalValidationRule } from "../../utils/generalValidation.js";


export let  createOrderSchema = {body: Joi.object({
    productId:generalValidationRule.dbId.required(),
    quantity: Joi.number().integer().min(1).required(),
    couponCode: Joi.string().allow('').optional(),
    paymentMethod: Joi.string().valid('Cash', 'Stripe', 'Paymob').required(),
    phoneNumbers: Joi.array().items(Joi.string().pattern(/^(?:\+20|0)?1[0-2]\d{8}$/)).required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required()
})}

export let convertOrderToCartSchema ={
    body:Joi.object({
        couponCode: Joi.string().allow('').optional(),
        paymentMethod: Joi.string().valid('Cash', 'Stripe', 'Paymob').optional(),
        phoneNumbers: Joi.array().items(Joi.string().pattern(/^(?:\+20|0)?1[0-2]\d{8}$/)).optional(),
        address: Joi.string().optional(),
        city: Joi.string().optional(),
        postalCode: Joi.string().optional(),
        country: Joi.string().optional()
    })
} 

export const deliverOrderSchema = {
    params:Joi.object({
        orderId: generalValidationRule.dbId.required(),
})
}


export const payWithStripeSchema = {
    params:Joi.object({
        orderId: generalValidationRule.dbId.required(),
})
}
export const refundOrderSchema = {
    params:Joi.object({
        orderId: generalValidationRule.dbId.required(),
})
}
export const cancelOrderSchema = {
    params:Joi.object({
        orderId: generalValidationRule.dbId.required(),
})
}
