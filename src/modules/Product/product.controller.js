// ========== add product ==============

import slugify from "slugify"
import Brand from "../../../DB/models/brand.model.js"
import { systemRoles } from "../../utils/systemRoles.js"
import generateUniqueString from "../../utils/generateUniqueString.js"
import cloudinaryConnection from "../../utils/cloudinary.js"
import Product from "../../../DB/models/product.model.js"
import { ApiFeatures } from "../../utils/api-features.js"
//============= add Product =================
export let addProduct = async (req,res,next)=>{
    //1- destruct the needed data 
    let {title,description,basePrice,discount,stock,specs} = req.body
    let {brandId, subCategoryId,categoryId}= req.query
    let addedBy = req.authUser._id
    //2- check on the brand, sub Category and Category: notice we'll do that from the brand since it contains the  sub Category id and Category id

    let brand = await Brand.findById(brandId)
    if(!brand){
        return next(new Error("Brand Not Found" , {casue:404}))
    }

    //2.1- Check For The Category
    if(brand.categoryId.toString() !== categoryId){
        return next(new Error("Brand is Not Found in this category" , {casue:404}))
    }
    //2.2- Check For The Sub-Category
    if(brand.subCategoryId.toString() !== subCategoryId){
        return next(new Error("Brand is Not Found in this sub category" , {casue:404}))
    }

    //3- make adding product is only for Super Admins and the brand owner
    console.log(addedBy);
    if(addedBy.role != systemRoles.SUPER_ADMIN && brand.addedBy.toString() != addedBy._id.toString()){
        return next(new Error("You Are Not Allowed To Add Product To This Brand" , {casue:404}))
    }

    //4- generate the slug

    let slug = slugify(title, {lower:true,replacement:"-"})

    //5- claulate the applied price
    // notice here we replaced the condition that checks for the discounts with logical OR
    let appliedPrice = basePrice - (basePrice*(discount || 0 ) / 100)

    // 6- add Images
    //6.1- check if Any images are sent 
    if(!req.files?.length){
        return next(new Error("Product Images are required" , {casue:400}))
    }
    // 6.2- initiate the Images Array and generate the folder id
    let Images = []
    let folderId = generateUniqueString(4)

    //6.3- there are multiple ways to get the folder folder path of the category and subCategory and the brand, we'll be using the brand public id 
    let folderPath = brand.Image.public_id.split(`${brand.folderId}/`)[0]

    //6.4- upload every images from the req.files and save the secure_url and public_id
    for (const file of req.files) {
        let {secure_url, public_id} = await cloudinaryConnection().uploader.upload(file.path,{
            folder:folderPath + `${brand.folderId}/Products/${folderId}`
        })
        Images.push({secure_url, public_id})
    }

    //6.5- pass the folder for the req.folder to be sent to the rollback middleware
    req.folder = folderPath + `${brand.folderId}/Products/${folderId}`

    //7- prepare the product Object
    
    let product = {
        title, description, slug, basePrice, discount,appliedPrice,stock, specs:JSON.parse(specs), categoryId, subCategoryId,brandId,addedBy:addedBy._id,Images,folderId
    }
    let newProduct = await Product.create(product)
    req.savedDocument = {collection:Product, _id: newProduct._id}
    res.status(201).json({success:true, message:"product added successfully", date: newProduct})
}

//============= Update Product =================


export const updateProduct = async (req, res, next) => {
    // data from the request body
    const { title, description, specs, stock, basePrice, discount, oldPublicId } = req.body
    // data for condition
    const { productId } = req.params
    // data from the request authUser
    const addedBy = req.authUser._id


    // prodcuct Id  
    const product = await Product.findById(productId)
    if (!product) return next({ cause: 404, message: 'Product not found' })

    // who will be authorized to update a product
    if (
        req.authUser.role !== systemRoles.SUPER_ADMIN &&
        product.addedBy.toString() !== addedBy.toString()
    ) return next({ cause: 403, message: 'You are not authorized to update this product' })

    // title update
    if (title) {
        product.title = title
        product.slug = slugify(title, { lower: true, replacement: '-' })
    }
    if (description) product.description = description
    if (specs) product.specs = JSON.parse(specs)
    if (stock) product.stock = stock

    // prices changes
    const appliedPrice = (basePrice || product.basePrice) - ((basePrice || product.basePrice) * (discount || product.discount) / 100)

    product.appliedPrice = appliedPrice

    if (basePrice) product.basePrice = basePrice
    if (discount) product.discount = discount


    if (oldPublicId) {

        if (!req.file) return next({ cause: 400, message: 'Please select new image' })
        const folderPath = product.Images[0].public_id.split(`${product.folderId}/`)[0]
        const newPublicId = oldPublicId.split(`${product.folderId}/`)[1]

        const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: folderPath + `${product.folderId}`,
            public_id: newPublicId
        })
        product.Images.map((img) => {
            if (img.public_id === oldPublicId) {
                img.secure_url = secure_url
            }
        })
        req.folder = folderPath + `${product.folderId}`
    }
    await product.save()
    res.status(200).json({ success: true, message: 'Product updated successfully', data: product })
}


//============= get all products =================

export let getAllProducts = async (req,res,next)=>{
    let {page, size,sort,...search } = req.query

    let features = new ApiFeatures(req.query, Product.find())
    // .pagination({page,size})
    .sort(sort)
    // .search(search)
    let products = await features.mongooseQuery
    res.status(200).json({ success: true, data: products })
}