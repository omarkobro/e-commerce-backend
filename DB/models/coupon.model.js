import mongoose, { Schema, model } from "mongoose";

let couponSchema = new Schema({
couponCode :{
    type:String,
    required: true,
    unique:true,
    trim:true,
    lowercase:true
},

couponValue:{
    type:Number,
    required: true,
    min:1
},
couponStatus:{
    type:String,
    default:"valid",
    enum:["valid","expired"]
},
isFixed:{
    type:Boolean,
    default:false
},
isEnabled:{
    type:Boolean,
    default:true
},
isPercentage:{
    type:Boolean,
    default:false
},
fromDate :{
    type:String,
    required: true,
},
toDate :{
    type:String,
    required: true,
},
addedBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required:true
},
updatedBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
},

disabledAt:{type: String},
disabledBy:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
enabledAt:{type: String},
enabledBy:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
},{timestamps:true})

// let Coupon = model("Coupon", couponSchema)
// export default Coupon

export default  model('Coupon', couponSchema) || mongoose.models.Coupon
