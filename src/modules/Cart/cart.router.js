import * as cartController from "./cart.controller.js"
import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import { systemRoles } from "../../utils/systemRoles.js";
import expressAsyncHandler from "express-async-handler";

let router = Router()

router.post("/addProductToCart", auth(systemRoles.ADMIN),expressAsyncHandler(cartController.addProductToCart))

router.put("/deleteProductFromCart/:productId",  auth(systemRoles.ADMIN),expressAsyncHandler(cartController.removeProductFroMCart))
export default router