import Product from "../../../../DB/models/product.model.js"

// notice that we don't return any errors or responses from the general functions  
// function to check Product Availabilty
export async function checkProductAvailability(productId, quantity) {
    const product = await Product.findById(productId)

    if (!product || product.stock < quantity) return null
    return product
}


// function to check Product Existence in cart
export async function checkProductIfExistsInCart(cart, productId) {

    return cart.products.some(
        (product) => product.productId.toString() === productId
    )

}

