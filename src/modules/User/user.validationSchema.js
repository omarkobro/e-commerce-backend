import Joi from "joi";
import { Types } from "mongoose";
import { systemRoles } from "../../utils/systemRoles.js";
import { generalValidationRule } from "../../utils/generalValidation.js";

const objectIdValidation = (value , helper)=>{
    const isValid = Types.ObjectId.isValid(value)
    return isValid ? value : helper.message('invalid object id')
}


export let userSchema = {
    body: Joi.object({
        userName: Joi.string()
        .min(2)
        .max(20)
        .messages({
            'string.min': 'Username must be at least {#limit} characters long.',
            'string.max': 'Username cannot be longer than {#limit} characters.'
        }),
        email: Joi.string().email({ tlds: { allow: ['com', 'org', 'yahoo'] }, minDomainSegments: 1 }).required(),
        password: Joi.string().required().min(6).max(16).messages({
            'string.base': 'Please enter a valid password.',
            'any.required': 'Password is required.',
            'string.min': 'Password must be at least {#limit} characters long.',
            'string.max': 'Password cannot be longer than {#limit} characters.'
        }),
        role: Joi.string().valid(systemRoles.ADMIN, systemRoles.SUPER_ADMIN,systemRoles.USER),
        age: Joi.number().required(),
        phoneNumbers:Joi.array().items(Joi.string().pattern(/^(?:\+20|0)?1[0-2]\d{8}$/)).required(),
        addresses: Joi.array().required(),
    })
}
export let loginSchema = {
    body: Joi.object({
        email: Joi.string().email({ tlds: { allow: ['com', 'org', 'yahoo'] }, minDomainSegments: 1 }).required(),
        password: Joi.string().required().min(6).max(16).messages({
            'string.base': 'Please enter a valid password.',
            'any.required': 'Password is required.',
            'string.min': 'Password must be at least {#limit} characters long.',
            'string.max': 'Password cannot be longer than {#limit} characters.'
        }),
    })
}

export let updateUserSchema = {
    body: Joi.object({
        userName: Joi.string()
        .min(2)
        .max(10)
        .messages({
            'string.min': 'Username must be at least {#limit} characters long.',
            'string.max': 'Username cannot be longer than {#limit} characters.'
        }),
        email: Joi.string().email({ tlds: { allow: ['com', 'org', 'yahoo'] }, minDomainSegments: 1 }),
        phoneNumbers: Joi.string().pattern(/^(?:\+20|0)?1[0-2]\d{8}$/),
        addresses: Joi.string(),
        age: Joi.number().min(14).max(99),
    }),
    params: Joi.object({
        id: Joi.string().custom(objectIdValidation)
    })
}

export let forgetPasswordSchema = {
    body: Joi.object({
        email: Joi.string().required().email({ tlds: { allow: ['com', 'org', 'yahoo'] }, minDomainSegments: 1 })
    })
}
export let resetPassword = {
    body: Joi.object({
        newPassword: Joi.string().required().min(6).max(16)
        .required()
        .min(6)
        .max(16)
        .messages({
            'string.base': 'Please enter a valid password.',
            'any.required': 'Password is required.',
            'string.min': 'Password must be at least {#limit} characters long.',
            'string.max': 'Password cannot be longer than {#limit} characters.'
        }),
        expiresIn: Joi.date().required(),
        OTP: Joi.string().required(),
    })
}

export let updatePassword = {
    body: Joi.object({
        currentPassword: Joi.string()
        .required()
        .min(6)
        .max(16)
        .messages({
            'string.base': 'Please enter a valid password.',
            'any.required': 'Password is required.',
            'string.min': 'Password must be at least {#limit} characters long.',
            'string.max': 'Password cannot be longer than {#limit} characters.'
        }),
            newPassword:  Joi.string()
            .required()
            .min(6)
            .max(16)
            .messages({
                'string.base': 'Please enter a valid password.',
                'any.required': 'Password is required.',
                'string.min': 'Password must be at least {#limit} characters long.',
                'string.max': 'Password cannot be longer than {#limit} characters.'
            }),
    })
}
