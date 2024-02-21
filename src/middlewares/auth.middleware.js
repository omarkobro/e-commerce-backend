import jwt from "jsonwebtoken"
import User from "../../DB/models/user.model.js"
//1- Initiate the outter function which will take the user role as a parameter
export let auth = (accessroles)=>{
    //2- initiate the actual middleware function
    return async(req,res,next)=>{
        try {
            //3 destruct the  current user token
            let {accesstoken}= req.headers
            //4-check first if the token is sent or not 
            if(!accesstoken){
                return next(new Error("please login first"), { cause: 401 })
            }
            //5-apply an extra security layer by adding prefix for the token
            if(!accesstoken.startsWith(process.env.TOKEN_PREFIX)){
                return next(new Error("Invalid Topken Prefix"), { cause: 400 })
            }
            let token = accesstoken.split("accesstoken_")[1]
            //6- decode the token to get the user id
            let decodedToken = jwt.verify(token,process.env.LOGIN_SECRET)
            //
            if (!decodedToken || !decodedToken.id) return next(new Error('invalid token payload', { cause: 400 }))

            //7- check on the user
            let findUser = await User.findById(decodedToken.id)
            if(!findUser){
                return next(new Error("Please Sign Up First"), { cause: 404 })
            }
            //8-apply authorization
            if(!accessroles.includes(findUser.role)){
                return next(new Error("Unauthorized"), { cause: 401 })
            }
            //9- pass the user within the requset and use next to continue the next middleware
            req.authUser = findUser
            next()
            } catch (err) {
                next(new Error('catch error in auth middleware', { cause: 500 }))
                console.log(err);
            }
    }
}