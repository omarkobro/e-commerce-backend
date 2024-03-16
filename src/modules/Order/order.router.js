import { Router } from 'express'
import * as orderController from "./order.controller.js"
import { auth } from '../../middlewares/auth.middleware.js'
import { orderPrivileges } from './order.prievilges.js'
import expressAsyncHandler from 'express-async-handler'
const router = Router()

router.post('/createOrder', 
auth(orderPrivileges.CREATE_ORDER),
expressAsyncHandler(orderController.crateOrder))
router.post('/cartToOrder', 
auth(orderPrivileges.CREATE_ORDER),
expressAsyncHandler(orderController.convertCartToOrder))


router.put('/deliverOrder/:orderId',
auth(orderPrivileges.DELIVER_ORDER),
expressAsyncHandler(orderController.deliverOrder))


export default router