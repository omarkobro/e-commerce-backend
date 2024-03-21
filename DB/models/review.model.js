import mongoose, { Schema, model } from "mongoose"


//============================== Create the review schema ==============================//

const reviewSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        REF:"User",
        required:true
    },
    productId:{
        type: Schema.Types.ObjectId,
        REF:"Product",
        required:true
    },
    reviewRate:{
        type:Number,
        required:true,
        min:1,
        max:5,
        enum:[1,2,3,4,5]
    },
    reviewComment:{
        type:String
    }
},
    {
        timestamps: true
    })

export default mongoose.models.Review || model('Review', reviewSchema)
