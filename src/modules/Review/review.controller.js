
import orderModel from "../../../DB/models/order.model.js"
import Product from "../../../DB/models/product.model.js"
import Review from "../../../DB/models/review.model.js"
import { ApiFeatures } from "../../utils/api-features.js"

//================= Add Review ========================
export let addReview = async(req,res,next) =>{
    let userId = req.authUser._id
    let {productId} = req.params
    let {reviewRate, reviewComment} = req.body

    let checkReview = await Review.findOne({userId,productId})

    if(checkReview){
        return next({message:"Already Reviewed ", cause:400})
    }

    let checkProduct = await orderModel.findOne({userId,"orderItems.product":productId, orderStatus : "Delivered"})
    if(!checkProduct){
        return next({message:"You Can't Review to this order until you buy it", cause:400})
    }
    let reviewObject = {
        userId,
        productId,
        reviewComment,
        reviewRate
    }
    let review = await Review.create(reviewObject)
    if(!review){
        return next({message:"Failed To Add Review", cause:500})
    }
    let product = await Product.findById(productId)
    let reviews = await Review.find({productId})
    let averageRating = 0
    for (const review of reviews) {
        averageRating += review.reviewRate 
    }
    product.rate = Number(averageRating / reviews.length).toFixed(1)
    await product.save()

    res.status(200).json({message:"Review Add Successfully", product, review })
}


//================= Delete Review ========================

export let deleteReview = async(req,res,next)=>{
    let {reviewId} = req.params
    let userId = req.authUser._id

    let checkReview = await Review.findById(reviewId)
    if(!checkReview){
        return next({message:"Couldn't Find Review", cause:404})
    }
    if(userId.toString() != checkReview.userId){
        return next({message:"You're Not Allowed To Delete This Review", cause:401})
    }

    let deletedReview = await Review.findByIdAndDelete(reviewId)
    if(!deletedReview){
        return next({message:"Deletion Failed, Please Try Again Later", cause:50})
    }
    res.status(200).json({message:"Review Deleted Successfully", deletedReview})
}


//================= Get All Reviews for a specific Product ========================

export let getReviewsForProduct = async (req,res,next)=>{
    let {productId} = req.params
    // let checkReview = await Review.find({productId})
    // if(!checkReview){
    //     return next({message:"Couldn't Find Review", cause:404})
    // }
    // res.status(200).json({message:"Success", checkReview})

    let {page, size,sort,...search } = req.query
    let features = new ApiFeatures(req.query,Review.find({productId}) )
    .pagination({page,size})
    .sort(sort)
    .search(search)
    let Reviews = await features.mongooseQuery
    res.status(200).json({ success: true, data: Reviews })
}