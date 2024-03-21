import * as cartController from "./cart.controller.js"
import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import expressAsyncHandler from "express-async-handler";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { DeleteProductSchema, addProductSchema } from "./cart.validationSchema.js";
import { CartPrivileges } from "./cart.privileges.js";

let router = Router()

router.post("/addProductToCart",validationMiddleware(addProductSchema), auth(CartPrivileges.ADD_TO_CART),expressAsyncHandler(cartController.addProductToCart))

router.put("/deleteProductFromCart/:productId",validationMiddleware(DeleteProductSchema), auth(CartPrivileges.DELETE_CART),expressAsyncHandler(cartController.removeProductFroMCart))
export default router