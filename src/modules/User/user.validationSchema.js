import Joi from "joi";
import { Types } from "mongoose";
import { systemRoles } from "../../utils/systemRoles.js";

const objectIdValidation = (value , helper)=>{
    const isValid = Types.ObjectId.isValid(value)
    return isValid ? value : helper.message('invalid object id')
}


export let userSchema = {
    body: Joi.object({
        userName: Joi.string().min(2).max(10).alphanum().required().messages({messages:"Please Enter A Valid First Name (ValidationSchema)"}),
        email: Joi.string().email({ tlds: { allow: ['com', 'org', 'yahoo'] }, minDomainSegments: 1 }).required(),
        password: Joi.string().required().min(6).max(16).messages({messages:"Please Enter A Valid Password (ValidationSchema)"}),
        role: Joi.string().valid(systemRoles.ADMIN, systemRoles.SUPER_ADMIN,systemRoles.USER),
        age: Joi.number().required(),
        phoneNumbers:Joi.array().items(Joi.string().pattern(/^(?:\+20|0)?1[0-2]\d{8}$/)).required(),
        addresses: Joi.array().required(),
    })
}
export let loginSchema = {
    body: Joi.object({
        email: Joi.string().email({ tlds: { allow: ['com', 'org', 'yahoo'] }, minDomainSegments: 1 }).required(),
        password: Joi.string().required().min(6).max(16).messages({messages:"Please Enter A Valid Password (ValidationSchema)"}),
    })
}

export let updateUserSchema = {
    body: Joi.object({
        userName: Joi.string().min(2).max(10).alphanum().messages({messages:"Please Enter A Valid First Name (ValidationSchema)"}),
        email: Joi.string().email({ tlds: { allow: ['com', 'org', 'yahoo'] }, minDomainSegments: 1 }),
        phoneNumbers: Joi.string().pattern(/^(?:\+20|0)?1[0-2]\d{8}$/),
        addresses: Joi.string(),
        age: Joi.number().min(14).max(99),
    }),
    params: Joi.object({
        id: Joi.string().custom(objectIdValidation)
    })
}

