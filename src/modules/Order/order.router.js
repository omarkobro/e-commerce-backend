import { Router } from 'express'
import * as orderController from "./order.controller.js"
import { auth } from '../../middlewares/auth.middleware.js'
import { orderPrivileges } from './order.prievilges.js'
import expressAsyncHandler from 'express-async-handler'
import { validationMiddleware } from '../../middlewares/validation.middleware.js'
import { cancelOrderSchema, convertOrderToCartSchema, createOrderSchema, deliverOrderSchema, payWithStripeSchema, refundOrderSchema } from './order.validationSchemas.js'
const router = Router()

router.post('/createOrder', 
auth(orderPrivileges.CREATE_ORDER),
validationMiddleware(createOrderSchema),
expressAsyncHandler(orderController.crateOrder))

router.post('/cartToOrder', 
auth(orderPrivileges.CREATE_ORDER),
validationMiddleware(convertOrderToCartSchema),
expressAsyncHandler(orderController.convertCartToOrder))


router.put('/deliverOrder/:orderId',
auth(orderPrivileges.DELIVER_ORDER),
validationMiddleware(deliverOrderSchema),
expressAsyncHandler(orderController.deliverOrder))

router.post('/payWithStripe/:orderId',validationMiddleware(payWithStripeSchema),auth(orderPrivileges.CREATE_ORDER),expressAsyncHandler(orderController.payWithStripe))
router.post('/webhook',
expressAsyncHandler(orderController.stripeWebhookLocal))

router.post('/refund/:orderId',
auth(orderPrivileges.REFUND_ORDER),
validationMiddleware(refundOrderSchema),
expressAsyncHandler(orderController.refundOrder))
router.delete("/cancelOrder/:orderId", validationMiddleware(cancelOrderSchema), auth(orderPrivileges.CANCEL_ORDER),expressAsyncHandler(orderController.cancelOrder))

export default router