// here we'll are rolling back any saved documnets in case the api failed 


export let rollBackSavedDocuments = async (req,res,next)=>{
    // we'll take the the desired collection and the id of the document from req.savedDocument
    if(req.savedDocument){
        console.log("rollBackSavedDocuments");
        // destruct the needed data to delete a documnet
        let {collection, _id} = req.savedDocument 
        await collection.findByIdAndDelete(_id)
    }
} 