import { forgetPasswordSchema, loginSchema, resetPassword, updatePassword,  userSchema,  } from "../User/user.validationSchema.js";

export let signUpSchema = userSchema
export let LoginSchema = loginSchema
export let forgetPassword = forgetPasswordSchema
export let ResetPassword = resetPassword
export let UpdatePassword = updatePassword
