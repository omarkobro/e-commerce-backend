import { DateTime } from "luxon"
import Coupon from "../../../DB/models/coupon.model.js"
import CouponUsers from "../../../DB/models/couponUsers.model.js"
import User from "../../../DB/models/user.model.js"
import { applyCouponValidation } from "../../utils/couponValidation.js"
import { ApiFeatures } from "../../utils/api-features.js"
import couponModel from "../../../DB/models/coupon.model.js"
import { systemRoles } from "../../utils/systemRoles.js"
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

    //4.2- add the coupon 
    // we added it her eso we don't crreate the coupon if there are any invalid IDs
    let coupon = await Coupon.create(couponObject)

    //7 - create the assigned users document
    let couponUsers = await CouponUsers.create(
        Users.map((ele) => ({...ele,couponId:coupon._id})
        ) 
    )
    res.status(201).json({message: "Coupon added successfully",coupon, couponUsers})
}

//============= Update coupon =================
export const updateCoupon = async (req, res, next) => {
    // data from the request body
    const { couponCode, couponValue, couponStatus, isFixed, isPercentage, toDate, fromDate } = req.body
    // data for condition
    const { couponId } = req.params
    // data from the request authUser
    const addedBy = req.authUser._id
    // prodcuct Id  
    const coupon = await Coupon.findById(couponId)
    if (!coupon) return next({ cause: 404, message: 'Coupon not found' })

    // who will be authorized to update a coupon
    if (
        req.authUser.role !== systemRoles.SUPER_ADMIN &&
        coupon.addedBy.toString() !== addedBy.toString()
    ) return next({ cause: 403, message: 'You are not authorized to update this product' })

    let updatedCouponObject = { couponCode, couponValue, couponStatus, isFixed, isPercentage, toDate, fromDate }
    let updatedCoupon = await Coupon.findByIdAndUpdate(couponId,updatedCouponObject, {new:true})
    
    res.status(200).json({ success: true, message: 'Coupon updated successfully', data: updatedCoupon })
}

// ==================== enable and disable coupon ======================

export let toggleEnableDisableCoupon = async (req, res,next)=>{
    //1- destruct needed data
    let {couponCode} = req.body
    let {_id} = req.authUser
    //2- apply Coupon Validation
    let isCouponValid = await applyCouponValidation(couponCode , _id)

    if(isCouponValid.status){
        return next({message:isCouponValid.msg , cause:isCouponValid.status})
    }
    //3- check if the coupon is enabled or disabled
    if(isCouponValid.isEnabled){
        //3.1 if the code is enabled we will disable it
        isCouponValid.isEnabled = false
        isCouponValid.enabledAt = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')
        isCouponValid.enabledBy = _id
        await isCouponValid.save() 
        return res.json({message:'Coupon Disabled', isCouponValid})
    }
    //3.2 if the code is Disabled we will enable it
    if(!isCouponValid.isEnabled){
        isCouponValid.isEnabled = true
        isCouponValid.disabledAt = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')
        isCouponValid.disabledBy = _id
        await isCouponValid.save()
        return res.json({message:'Coupon Enabled', isCouponValid})
    } 
}

//===================== get all disabled Coupons ======================
export let getAllDisabeldCoupons = async (req,res,next)=>{
    let getDisabledCoupons = await Coupon.find({isEnabled:false})
    if(!getDisabledCoupons || getDisabledCoupons.length <= 0 ){
        return next({message:"No Disabled Coupons Found",cause:404})
    }
    res.json({message:'Coupons', getDisabledCoupons})
}

//===================== get all Enabled Coupons ======================
export let getAllEnabledCoupons = async (req,res,next)=>{
    let getEnabledCoupons = await Coupon.find({isEnabled:true})
    if(!getEnabledCoupons || getEnabledCoupons.length <= 0 ){
        return next({message:"No Enabled Coupons Found",cause:404})
    }
    res.json({message:'Coupons', getEnabledCoupons})
}

//===================== get all Coupons ======================
export let getAllCoupons = async (req,res,next)=>{
    let {page, size,sort,...search } = req.query
    let features = new ApiFeatures(req.query, Coupon.find())
    .pagination({page,size})
    .sort(sort)
    .search(search)
    let Coupons = await features.mongooseQuery
    res.status(200).json({ success: true, data: Coupons })
}

//===================== get Coupon By Id ======================
export let getCouponById = async (req,res,next)=>{
    let {couponId} = req.params
    let checkCoupon = await couponModel.findById(couponId)
    if(!checkCoupon){
        return next({message:"Coupon Not Found",cause:404})
    }
    res.status(200).json({ success: true, data: checkCoupon })
}

