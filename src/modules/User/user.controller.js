import User from "../../../DB/models/user.model.js";

//============== Update Account=================
export let updateAccount = async (req,res,next) =>{
    let {_id} = req.authUser
    let {userName,email, phoneNumbers,addresses,age} = req.body
    if(email){
        const isEmailExists = await User.findOne({email});
        if (isEmailExists) {
            return  next(new Error("Email is already in use try something else" , {casue:409}));
        }
    }

    let updatedUserObject = {
        userName,
        email,
        phoneNumbers,
        addresses,
        age,
    }

    let updatedUser = await User.findByIdAndUpdate(_id, updatedUserObject,{new:true}
    )
    if(!updatedUser) return next(new Error('user not found' , {cause:404}))
    res.status(201).json({ message:'User updated successfully ' , updatedUser });
}

// ============= Delete Account ================
/**
 * 
  * destruct User Data 
  *   check for the user if found delete the user if not return error
 *  
 */
export let deleteAccount = async (req,res,next) =>{ 
    let {_id} = req.authUser
    let deletedUser = await User.findByIdAndDelete(_id)
    if(!deletedUser) return next(new Error('user not found' , {cause:404}))
    res.status(204).json({ message:'User Deleted successfully ' , deletedUser });
}

// ============= Get Account info ================


// get the user data by searching with the user id
export let getAccInfo = async(req,res,next)=>{
    let {_id} = req.authUser
    let user = await User.findById(_id)
    if(!user) return next(new Error('user not found' , {cause:404}))
    res.status(200).json({ message:'User Information' , user });
}
