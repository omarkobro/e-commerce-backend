import mongoose, { Schema, model } from "mongoose";

let couponUsersSchema = new Schema({
couponId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Coupon",
    required:true,

},
userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
},

maxUsage:{
    type:Number,
    required:true,
    min:1
},

usageCount:{
    type:Number,
    default:0
},


},{timestamps:true})

// let CouponUsers = model("CouponUsers",couponUsersSchema)

// export default CouponUsers

export default mongoose.models.CouponUsers || model('CouponUsers', couponUsersSchema)
