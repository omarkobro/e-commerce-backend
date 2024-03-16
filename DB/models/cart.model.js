import mongoose, { Schema, model } from "mongoose";

let cartSchema = new Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    products:[{
        productId:{type:mongoose.Schema.Types.ObjectId,ref:"Product",required:true},
        quantity:{
            type:Number,
            default:1,
            required:true
        },
        basePrice:{
            type:Number,
            default:0,
            required:true
        },
        finalPrice:{
            type:Number,
            required:true
        },
        title:{
            type:String,
            required:true
        },
    }],
    subTotal:{
        type:Number,
        default:0,
        required:true
    }
},{timestamps:true})

export default mongoose.models.Cart || model('Cart', cartSchema)
