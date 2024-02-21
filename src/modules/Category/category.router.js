import { Router } from "express"
import * as categoryController from "./category.controller.js"
import { auth } from "../../middlewares/auth.middleware.js"
import { systemRoles } from "../../utils/systemRoles.js"
import { multerMiddleHost } from "../../middlewares/multer.middleware.js"
import { allowedExtensions } from "../../utils/allowedExtensions.js"
import expressAsyncHandler from "express-async-handler"

let router = Router()

router.post("/addCategory",auth(systemRoles.SUPER_ADMIN),multerMiddleHost(allowedExtensions.image).single("categoryImage"),expressAsyncHandler(categoryController.addCategory))
router.post('/updateCategory/:categoryId',auth(systemRoles.SUPER_ADMIN),multerMiddleHost(allowedExtensions.image).single('categoryImage'),expressAsyncHandler(categoryController.updateCategory))

router.get("/getAllCategories", expressAsyncHandler(categoryController.getAllCategories))
router.delete('/deleteCategory/:categoryId',auth(systemRoles.SUPER_ADMIN),expressAsyncHandler(categoryController.deleteCategory))
export default router