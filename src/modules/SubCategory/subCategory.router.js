import { Router } from "express"
import * as subCategoryController from "./subCategory.controller.js"
import { auth } from "../../middlewares/auth.middleware.js"
import { systemRoles } from "../../utils/systemRoles.js"
import { multerMiddleHost } from "../../middlewares/multer.middleware.js"
import { allowedExtensions } from "../../utils/allowedExtensions.js"
import expressAsyncHandler from "express-async-handler"

let router = Router()

router.post("/addSubCategory/:categoryId",auth(systemRoles.SUPER_ADMIN),multerMiddleHost(allowedExtensions.image).single("subCategoryImage"),expressAsyncHandler(subCategoryController.addSubCategory))

router.put("/updateSubCategory/:subCategoryId",auth(systemRoles.SUPER_ADMIN),multerMiddleHost(allowedExtensions.image).single("subCategoryImage"),expressAsyncHandler(subCategoryController.updateSubCategory))

router.get("/getAllSubCategories",expressAsyncHandler(subCategoryController.getAllSubCategories))


export default router;