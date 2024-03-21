import { Router } from "express"
import * as brandController from "./brand.controller.js"
import { auth } from "../../middlewares/auth.middleware.js"
import { systemRoles } from "../../utils/systemRoles.js"
import { multerMiddleHost } from "../../middlewares/multer.middleware.js"
import { allowedExtensions } from "../../utils/allowedExtensions.js"
import expressAsyncHandler from "express-async-handler"
import { brandPrivileges } from "./brand.privileges.js"
import { validationMiddleware } from "../../middlewares/validation.middleware.js"
import { addBrandSchema, deleteBrandSchema, updateBrandSchema } from "./brand.validationSchema.js"

let router = Router()
router.post("/addBrand",validationMiddleware(addBrandSchema),auth(brandPrivileges.ADD_BRAND),multerMiddleHost(allowedExtensions.image).single("BrandImage"),expressAsyncHandler(brandController.addBrand))

router.put("/updateBrand/:brandId",validationMiddleware(updateBrandSchema),auth(brandPrivileges.UPDATE_BRAND),multerMiddleHost(allowedExtensions.image).single("BrandImage"),expressAsyncHandler(brandController.updateBrand))

router.get("/getAllBrands",expressAsyncHandler(brandController.getAllBrands))

router.delete('/deleteBrand/:brandId',validationMiddleware(deleteBrandSchema),auth(brandPrivileges.DELETE_BRAND),expressAsyncHandler(brandController.deleteBrand))


export default router