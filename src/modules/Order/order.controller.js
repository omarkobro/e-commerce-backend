
import { DateTime } from "luxon"
import Product from "../../../DB/models/product.model.js"
import CouponUsers from "../../../DB/models/couponUsers.model.js"
import Order from "../../../DB/models/order.model.js"
import { applyCouponValidation } from "../../utils/couponValidation.js"
import { checkProductAvailability } from "../Cart/cart-utils/checkProduct.js"
import { getUserCart } from "../Cart/cart-utils/getUserCart.js"
import { qrCodeGeneration } from "../../utils/generate-qr-code.js"
import { confirmPaymentIntent, createCheckoutSession, createPaymentIntent, createStripeCoupon, refundPaymentIntent } from "../../payment-handler/stripe.js"
import { nanoid } from "nanoid"
import createInvoice from "../../utils/pdfkit.js"
import { sendEmail } from "../../services/send-email.service.js"


//=================== make order =================
export let crateOrder = async (req,res,next)=>{
    //1- destruct needed data
    let {productId, quantity, couponCode, paymentMethod, phoneNumbers, address, city, postalCode, country}= req.body
    let {_id:userId} = req.authUser
    //2- check the coupon 
    //2.1 here we'll initaite teh coupon outside the if statment because we won't check on the coupon unless it's sent by the user
    let coupon = null
    if(couponCode){
        let isCouponValid = await applyCouponValidation(couponCode, userId)
        if(isCouponValid.status){
            return next({message:isCouponValid.msg , cause:isCouponValid.status})
        }
        coupon = isCouponValid
    }
    //3- check product Availability

    let isProductAvailable = await checkProductAvailability(productId,quantity)

    if(!isProductAvailable){
        return  next({message: 'Product is not available', cause: 400});
    }
    //4- set the product Information
    let orderItems = [{
        title: isProductAvailable.title,
        quantity,
        price: isProductAvailable.appliedPrice,
        product:isProductAvailable._id
    }] 

    //5- set Prices
    //5.1 we'll set shipping price as initial fixed value for now since we don't have locations system

    let shippingPrice = 80
    let totalPrice = (orderItems[0].price * quantity) +shippingPrice
    
    //6- check for the coupon type and coupon amount
    if (coupon?.isFixed && !(coupon?.couponValue <= totalPrice)) {
        return next({message: 'This Coupon Is Anavaliable', cause: 400});
    }
    if(coupon?.isFixed){
        totalPrice -= coupon.couponValue
    }
    else if(coupon?.isPercentage){
        totalPrice = totalPrice - (totalPrice * coupon.couponValue / 100)
    }

    //7- set order status and payment methods
    let orderStatus
    if(paymentMethod == "Cash"){
        orderStatus = "Placed"
    }
    //8- create order
    let orderObject = {
        userId,
        orderItems,
        shippingAddress:{address, city, postalCode, country},
        phoneNumbers,
        shippingPrice,
        coupon:coupon?._id,
        totalPrice,
        paymentMethod,
        orderStatus
    }
    let order = await Order.create(orderObject)
    await order.save()
    //9- reduce product quantity from the product model
    isProductAvailable.stock -= quantity
    await isProductAvailable.save()
    //10- cahnge the usage count for the coupon 
    if(coupon){
        await CouponUsers.updateOne({couponId:coupon._id, userId}, {$inc:{usageCount: 1}})
    }
    //11- generate QR code
    const orderQR =await qrCodeGeneration({orderId: order._id, user: order.user, totalPrice: order.totalPrice, orderStatus: order.orderStatus});

    //12- Create Invoice
    let orderCode = `${req.authUser.userName}_${nanoid(3)}`
    //12.1 - generate Invoice
    let orderInvoice = {
        shipping:{
            name:req.authUser.userName,
            address,
            city,
            state:"Cairo",
            country
        },
        orderCode,
        date:order.createdAt,
        items:order.orderItems,
        subTotal:order.totalPrice,
        paidAmount: order.totalPrice
    }
    createInvoice(orderInvoice,`${orderCode}.pdf`)

    let testPath = `./Files/${orderCode}.pdf`

    await sendEmail({to:req.authUser.email,subject: "Order Confirmation",message:`<h1>Check The Following File To Review YOur Order</h1> 
`,attachments:[
    {
        path:`./Files/${orderCode}.pdf`
    }
]})
    res.status(201).json({message: 'Order created successfully', orderQR,order});
}

//=================== Convert CART TO order =================
export let convertCartToOrder = async (req,res,next)=>{
    //1- destruct needed data
    let {couponCode, paymentMethod, phoneNumbers, address, city, postalCode, country}= req.body
    let {_id:userId} = req.authUser
    //2- check for the cart first

    let checkCart = await getUserCart(userId)
    if (!checkCart) {
        return  next({message: 'Cart Is not found', cause: 404});
    }

    //3- check the coupon 
    //3.1 here we'll initaite teh coupon outside the if statment because we won't check on the coupon unless it's sent by the user
    let coupon = null
    if(couponCode){
        let isCouponValid = await applyCouponValidation(couponCode, userId)
        if(isCouponValid.status){
            return next({message:isCouponValid.msg , cause:isCouponValid.status})
        }
        coupon = isCouponValid
    }
    //4- set the product Information
    let orderItems = checkCart.products.map((cartItem)=>{
        return {
            title: cartItem.title,
            quantity: cartItem.quantity,
            price: cartItem.basePrice,
            product: cartItem.productId
        }
    })

    //5- set Prices
    //5.1 we'll set shipping price as initial fixed value for now since we don't have locations system

    let shippingPrice = 80
    let totalPrice = checkCart.subTotal +shippingPrice
    
    //6- check for the coupon type and coupon amount
    if (coupon?.isFixed && !(coupon?.couponValue <= totalPrice)) {
        return next({message: 'This Coupon Is Anavaliable', cause: 400});
    }
    if(coupon?.isFixed){
        totalPrice -= coupon.couponValue
    }
    else if(coupon?.isPercentage){
        totalPrice = totalPrice - (totalPrice * coupon.couponValue / 100)
    }

    //7- set order status and payment methods
    let orderStatus
    if(paymentMethod == "Cash"){
        orderStatus = "Placed"
    }
    //8- create order
    let orderObject = {
        userId,
        orderItems,
        shippingAddress:{address, city, postalCode, country},
        phoneNumbers,
        shippingPrice,
        coupon:coupon?._id,
        totalPrice,
        paymentMethod,
        orderStatus
    }
    let order = await Order.create(orderObject)
    await order.save()

    //9- reduce product quantity from the product model
    for (const item of order.orderItems) {
        await Product.updateOne({_id: item.product}, {$inc: {stock: -item.quantity}})
    }
    //10- cahnge the usage count for the coupon 
    if(coupon){
        await CouponUsers.updateOne({couponId:coupon._id, userId}, {$inc:{usageCount: 1}})
    }
    res.status(201).json({message: 'Order created successfully',order});
}

// ======================= Deliver Order =======================//
export const deliverOrder = async (req, res, next) => {
    const {orderId}= req.params;

    const updateOrder = await Order.findOneAndUpdate({
        _id: orderId,
        orderStatus: {$in: ['Paid','Placed']}
    },{
        orderStatus: 'Delivered',
        deliveredAt: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
        deliveredBy: req.authUser._id,
        isDelivered: true
    },{
        new: true
    })

if(!updateOrder) return next({message: 'Order not found or It is already deliverd ', cause: 404});

    res.status(200).json({message: 'Order delivered successfully', order: updateOrder});
}


//================== Payment With Stripe ====================
export const payWithStripe = async (req, res, next) => {
    const {orderId}= req.params;
    const {_id:userId} = req.authUser;

    // get order details from our database
    const order = await Order.findOne({_id:orderId , userId , orderStatus: 'Pending'});
    if(!order) return next({message: 'Order not found or cannot be paid', cause: 404});

    const paymentObject = {
        customer_email:req.authUser.email,
        metadata:{orderId: order._id.toString()},
        discounts:[],
        line_items:order.orderItems.map(item => {
            return {
                price_data: {
                    currency: 'EGP',
                    product_data: {
                        name: item.title,
                    },
                    unit_amount: item.price * 100,
                },
                quantity: item.quantity,
            }
        })
    }
    // coupon check 
    if(order.coupon){
        const stripeCoupon = await createStripeCoupon({couponId: order.coupon});
        if(stripeCoupon.status) return next({message: stripeCoupon.message, cause: 400});

        paymentObject.discounts.push({
            coupon: stripeCoupon.id
        });
    }
    const checkoutSession = await createCheckoutSession(paymentObject);
    const paymentIntent = await createPaymentIntent({amount: order.totalPrice, currency: 'EGP'})

    order.payment_intent = paymentIntent.id;
    await order.save();

    res.status(200).json({checkoutSession });
}

//====================== stripe Webhook Local=================
export const stripeWebhookLocal  =  async (req,res,next) => {
    const orderId = req.body.data.object.metadata.orderId
    const confirmedOrder  = await Order.findById(orderId )
    if(!confirmedOrder) return next({message: 'Order not found', cause: 404});
    await confirmPaymentIntent( {paymentIntentId: confirmedOrder.payment_intent} );
    confirmedOrder.isPaid = true;
    confirmedOrder.paidAt = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');
    confirmedOrder.orderStatus = 'Paid';

    await confirmedOrder.save();
    res.status(200).json({message: 'webhook received'}); 
} 

//====================== Refund Order =================

export const refundOrder = async (req, res, next) => {
    const{orderId} = req.params; 

    const findOrder = await Order.findOne({_id: orderId, orderStatus: 'Paid'});
    if(!findOrder) return next({message: 'Order not found or cannot be refunded', cause: 404});

    // refund the payment intent
    const refund = await refundPaymentIntent({paymentIntentId: findOrder.payment_intent});

    findOrder.orderStatus = 'Refunded';
    await findOrder.save();

    res.status(200).json({message: 'Order refunded successfully', order: refund});
} 

// ====================== cancel order ===============================

/**
 * 1- check for the order 
 * 2- check for the auth user
 * 3- check for the creation time by checking on created at field 
 * 4- if the cancilation is happening within a day from the order action: first check if the order is paid or not, if not > delete the order & if true> delete the order and refund
 * 
 */

export let cancelOrder = async (req,res,next)=>{
    //1- destruct needed data
    let {orderId} = req.params
    let {_id} = req.authUser
    //2- check for the order existence
    let checkOrder = await Order.findById(orderId)
    if(!checkOrder){
        return next({message: 'Order not found', cause: 404});
    }
    //3- check for user authoriztion for cancling the order
    if(_id.toString() != checkOrder.userId.toString()){
        return next({message: "You're Not Allowed to cancel this order", cause: 401});
    }
    //4- check for the creation time
    let creationTime = DateTime.fromISO(checkOrder.createdAt.toISOString())
    let todayDate = DateTime.now()
    let diffInHours = Math.abs(todayDate.diff(creationTime, 'hours').hours)
    if(diffInHours > 24){
        return next({message: "You Can't cancel this order now because it's been more than 24 hours since you ordered it, for more details please contact the support ", cause: 403});
    }
    //5- check if the orderd is paid or not
    if(checkOrder.isPaid){
        //5.1 we'll delete the order from the DB
        let cancelledOrded = await Order.findById(orderId)
        if(!cancelledOrded){
            return next({message: "Something Went Wrong Please Try Again", cause: 403});
        }
        //5.2 refund the paid price
        const refund = await refundPaymentIntent({paymentIntentId: cancelledOrded.payment_intent});
        cancelledOrded.orderStatus = "Cancelled"
        cancelledOrded.cancelledAt = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');
        cancelledOrded.cancelledBy = _id
        return res.status(200).json({message: 'Order Cancled and refunded successfully', order: refund});
    }
    //6- if not paid then just deleteThe Order
    let cancelledOrded = await Order.findById(orderId)
    if(!cancelledOrded){
        return next({message: "Something Went Wrong Please Try Again", cause: 403});
    }
    cancelledOrded.orderStatus = "Cancelled"
    cancelledOrded.cancelledAt = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');
    cancelledOrded.cancelledBy = _id
    res.status(200).json({message: 'Order Cancled successfully', order: refund});
    return res.status(200).json({message: 'success',cancelledOrded});
}