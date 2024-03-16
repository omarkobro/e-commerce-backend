import Coupon from "../../../DB/models/coupon.model.js"
import CouponUsers from "../../../DB/models/couponUsers.model.js"
import User from "../../../DB/models/user.model.js"
import { applyCouponValidation } from "../../utils/couponValidation.js"
//===================== add Coupon =====================
export let addCoupon = async (req,res,next)=>{
    //1= destruct needed Data
    let {couponCode,couponValue,couponStatus,isFixed,isPercentage,fromDate,toDate,Users} = req.body
    let {_id:addedBy}= req.authUser 
    //2- check if the coupon is already exist in the DB
    let checkCoupon = await Coupon.findOne({couponCode})
    if(checkCoupon){return next(new Error("Coupon code already exist", {casue:409}))}
    //3- check if the user sent both percentage and fixed value
    if(isPercentage  == isFixed ){
        return next(new Error("Coupon can only be a percentage or a fixed amount", {casue:409}))
    }
    //3.1 check if he sent percentage that the percentage is not > 100%
    if(isPercentage){
        if(couponValue > 100){
            return next(new Error("Coupon percentage cannot be more the 100%", {casue:409}))
        }
    }

    //4- add the coupon 
    let couponObject = {couponCode,couponValue,couponStatus,isFixed,isPercentage,fromDate,toDate,addedBy,Users}

    let coupon = await Coupon.create(couponObject)

    //6 initiate the Assigned Users Array

    let userIds = []
    //6.1- push every user id provided in the Users array into usersIds array 
    for (const user of Users) {
        userIds.push(user.userId)
    }
    //6.2- check if the ids provided within the Users array is all in the DB
    // notice here that we used the $in operator to check if the _ids = to any value inside the array
    let checkUserIds = await User.find({_id:{$in:userIds}})
    //6.3 - if the Users array length is not equal to the length of the array of checkUsersId then this means that there are some invalid Ids provided in the users array 
    if(checkUserIds.length != Users.length){
        return next(new Error("Some Users Not found !", {casue:404}))
    } 
    //7 - create the assigned users document
    let couponUsers = await CouponUsers.create(
        Users.map((ele) => ({...ele,couponId:coupon._id})
        ) 
    )
    res.status(201).json({message: "Coupon added successfully",coupon, couponUsers})
}


//===================== Test Coupon =====================

export let testCoupon = async (req,res,next)=>{
    let {code} = req.body
    let {_id:userId} = req.authUser

    let isCouponValid = await applyCouponValidation(code,userId)
    if(isCouponValid.status){
        return next({message:isCouponValid.msg , cause:isCouponValid.status})
    }

    res.json({message:'coupon is valid', coupon:isCouponValid})

}