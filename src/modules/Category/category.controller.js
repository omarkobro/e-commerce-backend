
import slugify from "slugify"
import Category from "../../../DB/models/category.model.js"
import generateUniqueString from "../../utils/generateUniqueString.js"
import cloudinaryConnection from "../../utils/cloudinary.js"
import SubCategory from "../../../DB/models/sub-category.model.js"
import Brand from "../../../DB/models/brand.model.js"
import { ApiFeatures } from "../../utils/api-features.js"

//==================== Add Category =======================
export let addCategory = async (req,res,next)=>{
    // 1-destruct the category data and the loggedin User ID
    let{categoryName} = req.body
    let{_id} = req.authUser

    //2-check for the category name 
    let checkCategory = await Category.findOne({name:categoryName})
    if(checkCategory){
        return next(new Error("Category Name Is Already Used, Please Use Another One",{ cause: 500 }))}
    // 3- Generate Slug
    let slug = slugify(categoryName,"-")
    //4- Handle The Image
        //4.1- check if an image is sent or not
        if(!req.file){
            return next(new Error("Please Upload Category Image"),{ cause: 400 })
        }
        //4.2- generate Unique Folder Name
        let folderId = generateUniqueString(4)
        //4.3- upload The Image and get the secure URL and Public ID
        let {secure_url, public_id} = await cloudinaryConnection().uploader.upload(req.file.path,{
            folder:`${process.env.MAIN_FOLDER}/Categories/${folderId}`
        })
        // 4.4-  pass the fodler path to the rollback middleware
        req.folder = `${process.env.MAIN_FOLDER}/Categories/${folderId}`
    //5- Create Category Object
    let category = { 
        name:categoryName,
        slug,
        Image:{secure_url,public_id},
        folderId,
        addedBy: _id
    }
    //6- add the document to the category collection
    let addedCategory = await Category.create(category)
    res.status(201).json({ success: true, message: 'Category created successfully', addedCategory })
} 


//==================== Update Category =======================
export const updateCategory = async (req, res, next) => {
    // 1- destructuring the request body
    const { categoryName, oldPublicId } = req.body
    // 2- destructuring the request params 
    const { categoryId } = req.params
    // 3- destructuring _id from the request authUser
    const { _id } = req.authUser

    // 4- check if the category is exist using categoryId
    const category = await Category.findById(categoryId)
    if (!category) return next({ cause: 404, message: 'Category not found' })

    // 5- check if the use want to update the name field
    if (categoryName) {
        // 5.1 check if the new category name different from the old name
        if (categoryName == category.name) {
            return next({ cause: 400, message: 'Please enter different category name from the existing one.' })
        }

        // 5.2 check if the new category name is already exist
        const isNameDuplicated = await Category.findOne({ categoryName })
        if (isNameDuplicated) {
            return next({ cause: 409, message: 'Category name is already exist' })
        }

        // 5.3 update the category name and the category slug
        category.name = categoryName
        category.slug = slugify(categoryName, '-')
    }


    // 6- check if the user want to update the image
    if (oldPublicId) {
        if (!req.file) return next({ cause: 400, message: 'Image is required' })

        const newPulicId = oldPublicId.split(`${category.folderId}/`)[1]

        const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}`,
            public_id: newPulicId
        })

        category.Image.secure_url = secure_url
    }
    // 7- set value for the updatedBy field
    category.updatedBy = _id
    await category.save()
    res.status(200).json({ success: true, message: 'Category updated successfully', data: category })
}


//============================== get all categories ==============================
export const getAllCategories = async (req, res, next) => {
    // const categories = await Category.find().populate([{
    //     path:"Subcategories",
    //     populate:[{path:"Brands"}]
    // }])
    // res.status(200).json({ success: true, message: 'Categories fetched successfully', data: categories })

    let {page, size,sort,...search } = req.query
    let features = new ApiFeatures(req.query, Category.find().populate([{
        path:"Subcategories",
        populate:[{path:"Brands"}]
    }]))
    .pagination({page,size})
    .sort(sort)
    .search(search)
    let categories = await features.mongooseQuery
    res.status(200).json({ success: true, data: categories })
}


// ==================== Delete Category =========================


export const deleteCategory = async (req, res, next) => {

    //1 destruct Category Id
    const { categoryId } = req.params

    // 2- delete category
    const catgory = await Category.findByIdAndDelete(categoryId)
    if (!catgory) return next({ cause: 404, message: 'Category not found' })

    // 2-delete subcategories
    const subCategories = await SubCategory.deleteMany({ categoryId })
    if (subCategories.deletedCount <= 0) {
        console.log(subCategories.deletedCount);
        console.log('There is no related subcategories');
    }

    //3- delete the related brands
    const brands = await Brand.deleteMany({ categoryId })
    if (brands.deletedCount <= 0) {
        console.log(brands.deletedCount);
        console.log('There is no related brands');
    }
    
    // 4- delete the category folder from cloudinary
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Categories/${catgory.folderId}`)
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/Categories/${catgory.folderId}`)

    res.status(200).json({ success: true, message: 'Category deleted successfully' })
}


// ==================== Get All Sub Categories for a specific Category =========================

export let getSubCategoriesForCategory = async(req,res,next)=>{
    //1-destruct Data
    let {categoryId} = req.params
    //2- check for category 
    let checkCategory = await Category.findById(categoryId)
    if(!checkCategory){
        return next({ cause: 404, message: 'Category not found' })
    }
    //3- get all subcategories where the category Id is = to categoryId 
    let getAllSubCategories = await SubCategory.find({categoryId})
    console.log(getAllSubCategories);
    if(!getAllSubCategories){
        return next({message:"No Subcategoris found", cause:404})
    }
    res.status(200).json({ message: 'Success', getAllSubCategories })
}

// ==================== Get All Sub Categories for a specific Category =========================
export let getBrandsForCategory = async(req,res,next)=>{
    //1-destruct Data
    let {categoryId} = req.params
    //2- check for category 
    let checkCategory = await Category.findById(categoryId)
    if(!checkCategory){
        return next({ cause: 404, message: 'Category not found' })
    }
    //3- get all subcategories where the category Id is = to categoryId 
    let getAllBrands = await Brand.find({categoryId})
    console.log(getAllBrands);
    if(!getAllBrands || getAllBrands.length <= 0){
        return next({message:"No Brands found", cause:404})
    }
    res.status(200).json({ message: 'Success', getAllBrands })
}

// ==================== Get Category By Id =========================
export let getCategoryById = async(req,res,next)=>{
    //1-destruct Data
    let {categoryId} = req.params
    //2- check for category 
    let checkCategory = await Category.findById(categoryId)
    if(!checkCategory){
        return next({ cause: 404, message: 'Category not found' })
    }
    res.status(200).json({ message: 'Success', checkCategory })
}