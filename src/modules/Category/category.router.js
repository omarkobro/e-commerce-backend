import { Router } from "express"
import * as categoryController from "./category.controller.js"
import { auth } from "../../middlewares/auth.middleware.js"
import { systemRoles } from "../../utils/systemRoles.js"
import { multerMiddleHost } from "../../middlewares/multer.middleware.js"
import { allowedExtensions } from "../../utils/allowedExtensions.js"
import expressAsyncHandler from "express-async-handler"
import { categoryPrivileges } from "./category.privliges.js"
import { validationMiddleware } from "../../middlewares/validation.middleware.js"
import { addCategorySchema, deleteCategorySchema, updateCategorySchema } from "./category.validationSchema.js"

let router = Router()

router.post("/addCategory",validationMiddleware(addCategorySchema), auth(categoryPrivileges.CATEGORY_RULE),multerMiddleHost(allowedExtensions.image).single("categoryImage"),expressAsyncHandler(categoryController.addCategory))

router.post('/updateCategory/:categoryId',validationMiddleware(updateCategorySchema),auth(categoryPrivileges.CATEGORY_RULE),multerMiddleHost(allowedExtensions.image).single('categoryImage'),expressAsyncHandler(categoryController.updateCategory))

router.get("/getAllCategories", expressAsyncHandler(categoryController.getAllCategories))

router.get("/getCategoryById/:categoryId",validationMiddleware(deleteCategorySchema), expressAsyncHandler(categoryController.getCategoryById))

router.get("/getSubCategories/:categoryId",validationMiddleware(deleteCategorySchema),expressAsyncHandler(categoryController.getSubCategoriesForCategory))

router.get("/getBrands/:categoryId",validationMiddleware(deleteCategorySchema),expressAsyncHandler(categoryController.getBrandsForCategory))

router.delete('/deleteCategory/:categoryId',validationMiddleware(deleteCategorySchema),auth(categoryPrivileges.CATEGORY_RULE),expressAsyncHandler(categoryController.deleteCategory))

export default router