import { calculateSubTotal } from "./calcSubTotal.js";
import { checkProductIfExistsInCart } from "./checkProduct.js";


// here we want to update the product quantity 
export async function updateProductQuantity(cart, productId, quantity) {
    //1- check if the product is already in the cart
    const isProductExistInCart = await checkProductIfExistsInCart(cart, productId)
    //1.1 if not return null
    if (!isProductExistInCart) return null
    //2- loop through the products array and update the quantity and the final price
    cart?.products.forEach(product => {
        if (product.productId.toString() === productId) {
            product.quantity = quantity
            product.finalPrice = product.basePrice * quantity
        }
    })
    //3- calculate the sub total for the cart
    cart.subTotal = calculateSubTotal(cart.products)
    //4- return the saved document
    return await cart.save()
}

//================= version 2 from enhancement =================/
/**
  *@description we will remove the saving in db from here and save from the controller
 */
export async function updateProductQuantityV2(cart, productId, quantity) {
    const isProductExistInCart = await checkProductIfExistsInCart(cart, productId)
    if (!isProductExistInCart) return null

    cart?.products.forEach(product => {
        if (product.productId.toString() === productId) {
            product.quantity = quantity
            product.finalPrice = product.basePrice * quantity
        }
    })
    return cart.products

}