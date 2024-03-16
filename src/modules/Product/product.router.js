import { Router } from "express";
import * as productController from "./product.controller.js"
import { auth } from "../../middlewares/auth.middleware.js";
import { productPrievilges } from "./product.prievilges.js";
import { multerMiddleHost } from "../../middlewares/multer.middleware.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
import expressAsyncHandler from "express-async-handler";

let router = Router()

router.post("/addProduct", auth(productPrievilges.ADD_PRODUCT),multerMiddleHost(allowedExtensions.image).array("images",5), expressAsyncHandler(productController.addProduct))
router.put("/updateProduct/:productId", auth(productPrievilges.UPDATE_PRODUCT),multerMiddleHost(allowedExtensions.image).array("images"),expressAsyncHandler(productController.updateProduct))

router.get("/getProducts",expressAsyncHandler(productController.getAllProducts))
export default router