
import { DateTime } from "luxon"
import Product from "../../../DB/models/product.model.js"
import CouponUsers from "../../../DB/models/couponUsers.model.js"
import Order from "../../../DB/models/order.model.js"
import { applyCouponValidation } from "../../utils/couponValidation.js"
import { checkProductAvailability } from "../Cart/cart-utils/checkProduct.js"
import { getUserCart } from "../Cart/cart-utils/getUserCart.js"
import { qrCodeGeneration } from "../../utils/generate-qr-code.js"


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

    console.log(orderItems.quantity);
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
