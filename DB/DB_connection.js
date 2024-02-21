
import mongoose from "mongoose"
let db_connection = async ()=>{
    await mongoose.connect(process.env.LOCAL_CONNECTION_URL).then((res)=>{
        console.log("Data base connected successfully");
    }).catch((err)=>{
        console.log("Data base connection failed",err);
    })
}

export default db_connection;