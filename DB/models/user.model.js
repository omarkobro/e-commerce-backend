import mongoose, { Schema, model } from "mongoose";
import { systemRoles } from "../../src/utils/systemRoles.js";

let userSchema = new Schema({
    userName:{
        type:String,
        required:true,
        minlength:2,
        maxlength:10,
        trim:true,
        lowercase:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
        minlength:8
    },
    phoneNumbers:[{
        type:String,
        required:true
    }],
    addresses:[{
        type:String,
        required:true
    }],
    role:{
        type:String,
        required:true,
        enum:[systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPER_ADMIN],
        default:systemRoles.USER
    },
    isEmailVerified :{
        type:Boolean,
        default:false
    },
    age:{
        type:Number,
        min:14,
        max:99,
        required:true
        
    },
    isLoggedIn :{
        type:Boolean,
        default:false
    },
},{timestamps:true})

// let User = model("User", userSchema)

// export default User

export default mongoose.models.User || model('User', userSchema)
