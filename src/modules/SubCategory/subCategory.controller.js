import slugify from "slugify";
import Category from "../../../DB/models/category.model.js";
import SubCategory from "../../../DB/models/sub-category.model.js"
import generateUniqueString from "../../utils/generateUniqueString.js"
import cloudinaryConnection from "../../utils/cloudinary.js";

//==================== Add Sub Category =======================
export let addSubCategory = async (req,res,next)=>{
    // 1-destruct the Sub category data and the loggedin User ID
    let{subCategoryName} = req.body
    let{categoryId} = req.params
    let{_id} = req.authUser

    //2-check for the Sub category name 
    let checkSubCategory = await SubCategory.findOne({name:subCategoryName})
    if(checkSubCategory){
        return next(new Error("Sub Category Name Is Already Used, Please Use Another One",{ cause: 500 }))}
    //2.1-check for the category  
    let checkCategory = await Category.findById(categoryId)
    if(!checkCategory){
        return next(new Error("Category Not Found !",{ cause: 404 }))}
    // 3- Generate Slug
    let slug = slugify(subCategoryName,"-")

    //4- Handle The Image
        //4.1- check if an image is sent or not
        if(!req.file){
            return next(new Error("Please Upload Category Image"),{ cause: 400 })
        }
        //4.2- generate Unique Folder Name
        let folderId = generateUniqueString(4)
        //4.3 upload The Image and get the secure URL and Public ID
        let {secure_url, public_id} = await cloudinaryConnection().uploader.upload(req.file.path,{
            folder:`${process.env.MAIN_FOLDER}/Categories/${checkCategory.folderId}/SubCategories/${folderId}`
        })
    //5- Create Category Object
    let subCategory = { 
        name:subCategoryName,
        slug,
        Image:{secure_url,public_id},
        folderId,
        addedBy: _id,
        categoryId
    }
    //6- add the document to the category collection
    let addedSubCategory = await SubCategory.create(subCategory)
    res.status(201).json({ success: true, message: 'Sub Category created successfully', addedSubCategory })
} 
//==================== Update Sub Category =======================

export const updateSubCategory = async (req, res, next) => {
    // 1- destructuring _id from the request authUser
    const { _id } = req.authUser
    // 2- destructuring the request body
    const { subCategoryName, oldPublicId } = req.body
    // 3- destructuring the request params 
    const { subCategoryId } = req.params

    // 4- check if the category is exist using sub categoryId
    const subCategory = await SubCategory.findById(subCategoryId).populate([{path:"categoryId",select:"folderId"}])
    if (!subCategory) return next({ cause: 404, message: 'Category not found' })

    // 5- check if the user wants to update the name field
    if (subCategoryName) {
        // 5.1 check if the new Sub category name different from the old name
        if (subCategoryName == subCategory.name) {
            return next({ cause: 400, message: 'Please enter different category name from the existing one.' })
        }

        // 5.2 check if the new category name is already exist
        const isNameDuplicated = await SubCategory.findOne({ subCategoryName })
        if (isNameDuplicated) {
            return next({ cause: 409, message: 'Category name is already exist' })
        }

        // 5.3 update the category name and the category slug
        subCategory.name = subCategoryName
        subCategory.slug = slugify(subCategoryName, '-')
    }


    // 6- check if the user want to update the image
    if (oldPublicId) {
        if (!req.file) return next({ cause: 400, message: 'Image is required' })

        const newPulicId = oldPublicId.split(`${subCategory.folderId}/`)[1]

        const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: `${process.env.MAIN_FOLDER}/Categories/${subCategory.categoryId.folderId}/SubCatiegores/${subCategory.folderId}`,
            public_id: newPulicId
        })

        subCategory.Image.secure_url = secure_url
    }
    // 7- set value for the updatedBy field
    subCategory.updatedBy = _id
    await subCategory.save()
    res.status(200).json({ success: true, message: 'Category updated successfully', data: subCategory })
}


//============================== get all Sub categories ==============================
export const getAllSubCategories = async (req, res, next) => {
    const subCategories = await SubCategory.find().populate([{
        path:"Brands"}])
    res.status(200).json({ success: true, message: 'Sub Categories fetched successfully', data: subCategories })
}
