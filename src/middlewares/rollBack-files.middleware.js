// here we'll are rolling back any saved images in case the api failed 

import cloudinaryConnection from "../utils/cloudinary.js";

export let rollBackUploadedFiles = async (req,res,next) =>{
    // we'll take the folder path as a parameter from req.folder
    if(req.folder){
        console.log("rollback uploaded file MiddlWare");
        console.log(req.folder);
        await cloudinaryConnection().api.delete_resources_by_prefix(req.folder)
        await cloudinaryConnection().api.delete_folder(req.folder)
    }
    // we will call next to move to the next middleware
    next()
}  