
// Here we're optimizing the index.js file by moving all the lines we can from the index an adding it to one function which will be invoked in the index.js file
// instead of loading express twice we will pass express as a parameter here
// notice that we here add every thing other than routers since they will be added in a dedicated file 
import db_connection from "../DB/DB_connection.js";
import { globalResponse } from "../src/middlewares/globalResponse.middleware.js";
import * as routers from "./modules/index.routers.js"

export let initiateApp = (app ,express)=>{
    let port = process.env.PORT
    app.use(express.json())
    app.use("/auth", routers.authRouter)
    app.use("/category", routers.categoryRouter)
    app.use("/subCategory", routers.subCategoryRouter)
    app.use("/brand", routers.brandRouter)
    app.use("/user", routers.userRouter)
    app.use(globalResponse)
    db_connection()
    app.listen(port, ()=>{console.log("app is running successfully on port 3000");})
}