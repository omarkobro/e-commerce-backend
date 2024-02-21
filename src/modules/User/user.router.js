import { Router } from "express"
import * as userController from "./user.controller.js"
import { auth } from "../../middlewares/auth.middleware.js"
import { systemRoles } from "../../utils/systemRoles.js"
import { multerMiddleHost } from "../../middlewares/multer.middleware.js"
import { allowedExtensions } from "../../utils/allowedExtensions.js"
import expressAsyncHandler from "express-async-handler"
import { userPrivileges } from "./user.prievliges.js"
import { validationMiddleware } from "../../middlewares/validation.middleware.js"
import { updateUserSchema } from "./user.validationSchema.js"

let router = Router()

router.put("/updateUser",validationMiddleware(updateUserSchema), auth(userPrivileges.UPDATE_ACC) , expressAsyncHandler(userController.updateAccount))
router.delete("/deleteUser",auth(userPrivileges.UPDATE_ACC) , expressAsyncHandler(userController.deleteAccount))
router.get("/getUserInfo",auth(userPrivileges.GET_ACC_INFO) , expressAsyncHandler(userController.getAccInfo))
export default router;