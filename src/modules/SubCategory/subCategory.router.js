import { Router } from "express"
import * as subCategoryController from "./subCategory.controller.js"
import { auth } from "../../middlewares/auth.middleware.js"
import { systemRoles } from "../../utils/systemRoles.js"
import { multerMiddleHost } from "../../middlewares/multer.middleware.js"
import { allowedExtensions } from "../../utils/allowedExtensions.js"
import expressAsyncHandler from "express-async-handler"
import { validationMiddleware } from "../../middlewares/validation.middleware.js"
import { SgetSubCategoryByIdSchema, addSubCategorySchema, deleteSubCategorySchema, getBrandsForSubCategorySchema } from "./subCategory.validationSchema.js"
import { subCategoryPrivileges } from "./subCategory.privileges.js"

let router = Router()

router.post("/addSubCategory/:categoryId", validationMiddleware(addSubCategorySchema),auth(subCategoryPrivileges.ADD_SUBCATEGORY),multerMiddleHost(allowedExtensions.image).single("subCategoryImage"),expressAsyncHandler(subCategoryController.addSubCategory))

router.put("/updateSubCategory/:subCategoryId",auth(systemRoles.SUPER_ADMIN),multerMiddleHost(allowedExtensions.image).single("subCategoryImage"),expressAsyncHandler(subCategoryController.updateSubCategory))

router.get("/getAllSubCategories",expressAsyncHandler(subCategoryController.getAllSubCategories))

router.delete("/deleteSubCategory/:subCategoryId",validationMiddleware(deleteSubCategorySchema),auth(systemRoles.SUPER_ADMIN),expressAsyncHandler(subCategoryController.deleteSubCategory))

router.get("/getSubCategoryById/:subCategoryId",validationMiddleware(SgetSubCategoryByIdSchema),expressAsyncHandler(subCategoryController.getSubCategoryById))

router.get("/getBrands/:subCategoryId",validationMiddleware(getBrandsForSubCategorySchema),expressAsyncHandler(subCategoryController.getBrandsForSubCategory))

export default router;