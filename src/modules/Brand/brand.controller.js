import slugify from "slugify";
import Brand from "../../../DB/models/brand.model.js";
import Category from "../../../DB/models/category.model.js";
import SubCategory from "../../../DB/models/sub-category.model.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generateUniqueString.js";

//==================== Add Brand =======================
export let addBrand = async (req,res,next)=>{
    // 1-destruct the Sub category data and the loggedin User ID
    let{brandName} = req.body
    let{categoryId,subCategoryId} = req.query
    let{_id} = req.authUser

    //2-check for the Brand name 
    let checkBrand = await Brand.findOne({name:brandName})
    if(checkBrand){
        return next(new Error("Brand Name Is Already Used, Please Use Another One",{ cause: 500 }))}
    //2.1-check for the sub category  
    let checkSubCategory = await SubCategory.findById(subCategoryId).populate([{path:"categoryId",select:"folderId"}])
    // populate("categoryId","folderId") <<<<<<<<<<<<<<<check>>>>>
    if(!checkSubCategory){
        return next(new Error("Sub Category Not Found !",{ cause: 404 }))}

    //2.2-check for the category  
    if(categoryId != checkSubCategory.categoryId._id){
        return next(new Error("Category Not Found !",{ cause: 404 }))}
    // 3- Generate Slug
    let slug = slugify(brandName,"-")

    //4- Handle The Image
        //4.1- check if an image is sent or not
        if(!req.file){
            return next(new Error("Please Upload Brand Image"),{ cause: 400 })
        }
        //4.2- generate Unique Folder Name
        let folderId = generateUniqueString(4)
        //4.3 upload The Image and get the secure URL and Public ID
        let {secure_url, public_id} = await cloudinaryConnection().uploader.upload(req.file.path,{
            folder:`${process.env.MAIN_FOLDER}/Categories/${checkSubCategory.categoryId.folderId}/SubCategories/${checkSubCategory.folderId}/Brands/${folderId}`
        })
    //5- Create Category Object
    let brand = {  
        name:brandName,
        slug,
        Image:{secure_url,public_id},
        folderId,
        addedBy: _id,
        categoryId,
        subCategoryId
    }
    //6- add the document to the category collection
    let addedBrand = await Brand.create(brand)
    res.status(201).json({ success: true, message: 'Brand created successfully', addedBrand })
} 
//==================== Update Brand =======================
export const updateBrand = async (req, res, next) => {
    // 1- destructuring _id from the request authUser
    const { _id } = req.authUser
    // 2- destructuring the request body
    const { brandName, oldPublicId } = req.body
    // 3- destructuring the request params 
    const { brandId } = req.params

    // 4- check if the category is exist using sub categoryId
    const brand = await Brand.findById(brandId).populate([{path:"categoryId",select:"folderId"},{path:"subCategoryId",select:"folderId"}])

    if(brand.addedBy.toString() != _id.toString()){
        return next({ cause: 404, message: 'Only The Brand Owner Can Change Their Brand Name' })
    }



    if (!brand) return next({ cause: 404, message: 'Brand not found' })

    // 5- check if the user wants to update the name field
    if (brandName) {
        // 5.1 check if the new Brand name different from the old name
        if (brandName == brand.name) {
            return next({ cause: 400, message: 'Please enter different Brand name from the existing one.' })
        }

        // 5.2 check if the new Brand name is already exist
        const isNameDuplicated = await Brand.findOne({ brandName })
        if (isNameDuplicated) {
            return next({ cause: 409, message: 'Brand name is already exist' })
        }

        // 5.3 update the category name and the category slug
        brand.name = brandName
        brand.slug = slugify(brandName, '-')
    }


    // 6- check if the user want to update the image
    if (oldPublicId) {
        if (!req.file) return next({ cause: 400, message: 'Image is required' })

        const newPulicId = oldPublicId.split(`${brand.folderId}/`)[1]

        const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: `${process.env.MAIN_FOLDER}/Categories/${brand.categoryId.folderId}/SubCatiegores/${brand.subCategoryId.folderId}`,
            public_id: newPulicId
        })

        brand.Image.secure_url = secure_url
    }
    // 7- set value for the updatedBy field
    brand.updatedBy = _id
    await brand.save()
    res.status(200).json({ success: true, message: 'Brand updated successfully', data: brand })
}

//============================== get all Brands ==============================
export const getAllBrands = async (req, res, next) => {
    const brands = await Brand.find()
    res.status(200).json({ success: true, message: 'Brands fetched successfully', data: brands })
}


// ==================== Delete Brand =========================


export const deleteBrand = async (req, res, next) => {

    //1 destruct Brand Id
    const { brandId } = req.params
    
    

    //3- delete brand
    const brand = await Brand.findByIdAndDelete(brandId).populate([{path:"categoryId",select:"folderId"},{path:"subCategoryId",select:"folderId"}])
    if (!brand) {
        return next({ cause: 404, message: 'No Brands Found' })
    }

    // 4- delete the category folder from cloudinary
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Categories/${brand.categoryId.folderId}/subCategories/${brand.subCategoryId.folderId}/Brands/${brand.folderId}`)
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/Categories/${brand.categoryId.folderId}/subCategories/${brand.subCategoryId.folderId}/Brands/${brand.folderId}`)
    return res.status(200).json({ success: true, message: 'Brand deleted successfully' })
}