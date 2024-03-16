import Cart from "../../../DB/Models/cart.model.js"
import { addCart } from "./cart-utils/addCartFunction.js"
import { pushNewProduct } from "./cart-utils/addProductToCart.js"
import { calculateSubTotal } from "./cart-utils/calcSubTotal.js"
import { checkProductAvailability } from "./cart-utils/checkProduct.js"
import { getUserCart } from "./cart-utils/getUserCart.js"
import { updateProductQuantity } from "./cart-utils/updateProductQuantity.js"

// =============== add product to cart =====================
export const addProductToCart = async (req, res, next) => {

    //1- destruct Needed Data
    const { productId, quantity } = req.body
    const { _id } = req.authUser

    //2- check for product Availability
    const product = await checkProductAvailability(productId, quantity)
    //2.1 null case
    if (!product) return next({ message: 'Product not found or not available', cause: 404 })


    //3- check if the user has a cort or not
    const userCart = await getUserCart(_id)

    //4-  if the user doesn't have a cart then add a cart for him and push the new product inside of the products array
    if (!userCart) {
        const newCart = await addCart(_id, product, quantity)
        return res.status(201).json({ message: 'Product added to cart successfully', data: newCart })
    }
    //5- update product qantity
    const isUpdated = await updateProductQuantity(userCart, productId, quantity)
    //5.1 if the updationg failed we will add push the new product
    if (!isUpdated) {
        const added = await pushNewProduct(userCart, product, quantity)
        if (!added) return next({ message: 'Product not added to cart', cause: 400 })
    }
    res.status(201).json({ message: 'Product added to cart successfully', data: userCart })
}

// =============== Remove Product from cart =====================


export let removeProductFroMCart = async (req,res,next)=>{
    //1- destruct needed data
    const { productId } = req.params
    const { _id } = req.authUser

    //2- check if the product exists in the user cart

    //2.1 noitce here that mongose provide us with a method allows us to check on something inside an array by writing it and the key as string
    let checkUserCart = await Cart.findOne({userId:_id, "products.productId" : productId})
    if(!checkUserCart){
        return next({ message: 'Product not found in cart', cause: 404 })
    }
    //3- here we delete the product from the products array using filter

    checkUserCart.products = checkUserCart.products.filter((product)=>{
        return product.productId.toString() != productId
    })
    //4- calculate the subTotal
    checkUserCart.subTotal = calculateSubTotal(checkUserCart.products)

    let newCart = await checkUserCart.save()

    if(newCart.products.length == 0 ){
        await Cart.findByIdAndDelete(newCart._id)
    }
    res.status(201).json({ message: 'Product deleted successfully'})
}


