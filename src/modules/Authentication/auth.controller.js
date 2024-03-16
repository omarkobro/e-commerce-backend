import User from "../../../DB/models/user.model.js"

import bcryptjs from "bcryptjs"
import { sendEmail } from "../../services/send-email.service.js"
import jwt from 'jsonwebtoken'
/**
 * destruct the user data
 * check if the the user already exists
 * if exists return error
 * if not hash the password
 * create the user
 * 
 */

//========================= Sign Up ===============================
export let signUp = async (req,res,next)=>{
    //1- destruct the user data
    let {userName, email, password, age, phoneNumbers, addresses,role} = req.body   
    //2- * check if the the user already exists
    let checkUser = await User.findOne({email})
    // 3- * if exists return error
    if(checkUser){
        return next(new Error("Email Already Exists" , {casue:404}))
    }
    // 4-generate verification token and link
    let verificationToken = jwt.sign({email}, process.env.EMAIL_VERFICATION_SECRET, { expiresIn: '1h' });
    let verificationLink = `${req.protocol}://${req.headers.host}/auth/verifyEmail?token=${verificationToken}`
    //4-send verification email 
    let isEmailAccepted = await sendEmail({to:email,subject: "Email Verification",message:`<h1>Follow This Link To Verifiy Your Account</h1> 
    <a href='${verificationLink}'>Click To Verify Email </a>`,attachments:[]})

    if(!isEmailAccepted){
        return next(new Error("Verification Failed please try again later" , {casue:500}))
    }
    //5-hashPassword
    let  hashedPassword = bcryptjs.hashSync(password, +process.env.SALT_ROUNDS)
    //6- create the new user and then save
    let newUser = await User.create({userName, email, password:hashedPassword, age, phoneNumbers, addresses,role} )
    newUser.save()
    res.status(201).json({
message:"Signed Up Successfully",newUser})
}

//=========================  Verify Email ===============================

export let verifyEmail = async (req,res,next) =>{
    // here we will check the token provided in the query and check for user 
    let {token} = req.query
    let decodedToken = jwt.verify(token, process.env.EMAIL_VERFICATION_SECRET)
    let checkUser = await User.findOneAndUpdate({email: decodedToken.email,isEmailVerified:false},{isEmailVerified:true},{new:true})
    if(!checkUser){
        return next({message:"Already verified", cause:404})
    }
    res.status(200).json({message:"Email verified successfully , please try to login"})
}


//=========================  Login ===============================
export let login = async (req,res,next)=>{
    //1- destruct user data
    let {email, password} = req.body
    //2- check for the email
    let checkEmail = await User.findOne({email})
    if(!checkEmail){
        return next({message:"Invalid Login Credentials", cause:404})

    }
    //3-check for password
    let checkPassword = bcryptjs.compareSync(password,checkEmail.password)
    if(!checkPassword){
        return next({message:"Invalid Login Credentials", cause:404})
    }

    //4-check if the email is verified 
    if(!checkEmail.isEmailVerified){
        return next({message:"Please Verify Your Email First", cause:404})
    }
    //5- generate token
    let userToken = jwt.sign({id:checkEmail._id, email, isLogged:true}, process.env.LOGIN_SECRET, { expiresIn: '1h' } )
    //6- change the user status to logged in and save
    checkEmail.isLoggedIn = true
    checkEmail.save()
    res.status(200).json({message:"Logged IN Successfully",userToken})
} 