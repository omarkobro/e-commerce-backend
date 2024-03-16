// here we'll add the main pagination function 
// the function will take the page number and the size of viewed documents as parameters with initial values
export let paginationFunction = ({page = 1, size= 3})=>{
    if(page < 1) page = 1
    if(size < 1) size = 3

    // herte we calculate the limit adn skip which will be later used in the query 

    let limit = +size
    let skip = (+page - 1) *limit

    return {limit, skip}
}