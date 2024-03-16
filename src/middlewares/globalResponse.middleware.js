export let globalResponse =  (err,req,res,next) =>{ 
    if(err){
        res.status(err["cause"] || 500).json({
            message: "Catch Error By Global Response",
            error_message: err.message,
            stack:err.stack
        })
        next()
    }
} 