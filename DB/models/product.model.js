import mongoose, { Schema, model } from "mongoose"


//============================== Create the Product schema ==============================//

const productSchema = new Schema({
    //Strings
title:{type:String, required:true, trim:true},
description:{type:String},
slug:{type:String, required:true,},
folderId:{type:String, required:true, unique:true},
    // Numbers
basePrice:{type:Number, required:true},
discount:{type:Number, defualt:0},
appliedPrice:{type:Number, required:true},
stock:{type:Number, required:true, min:0, defualt:0},
rate:{type:Number, default:0, min:0 , max:0},
    //Arrays
Images:[
    {
        secure_url:{type:String, required:true},
        public_id:{type:String, required:true, unique:true},
    }
],
specs:{
    // here we'll add the type Map which very close to object behaviour
    type:Map,
    of: String| Number
},

    //objectIds
    addedBy:{type:Schema.Types.ObjectId, ref:"User", required:true},
    updatedBy:{type:Schema.Types.ObjectId, ref:"User"},
    brandId:{type:Schema.Types.ObjectId, ref:"Brand", required:true},
    subCategoryId:{type:Schema.Types.ObjectId, ref:"SubCategory", required:true},
    categoryId:{type:Schema.Types.ObjectId, ref:"Category", required:true}
},
    {
        timestamps: true
    })

// let Product = model('Product', productSchema)
// export default Product
export default mongoose.models.Product || model('Product', productSchema)
