const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {items: [{productId: {type: Schema.Types.ObjectId, required: true, ref: 'Product'}, quantity: {type: Number, required: true}}]}
})

userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === product._id.toString()
    })
    const updatedCartItems = [...this.cart.items]
    let newQuantity = 1
    if (cartProductIndex>=0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1
        updatedCartItems[cartProductIndex].quantity = newQuantity
    } else {
        updatedCartItems.push({productId: product._id, quantity: newQuantity})
    }
    const updatedCart = {
        items: updatedCartItems
    }
    this.cart = updatedCart
    return this.save()
}

userSchema.methods.removeFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString()
    })
    this.cart.items = updatedCartItems
    return this.save()
}

userSchema.methods.clearCart = function() {
    this.cart = {items: []}
    return this.save()
}

module.exports = mongoose.model('User', userSchema)

// const mongodb = require('mongodb')
// const getDB = require('../util/database').getDB

// const ObjectId = mongodb.ObjectId

//             updatedCartItems[cartProductIndex].quantity = newQuantity
//         } else {
//             updatedCartItems.push({productId: new ObjectId(product._id), quantity: newQuantity})
//         }
//         const updatedCart = {
//             items: updatedCartItems
//         }
//         const db = getDB()
//         return db.collection('users').updateOne({_id:new ObjectId(this._id)}, {$set: {cart: updatedCart}})
//     }

//     removeProductFromCart(productId) {
//         const db = getDB()
//         const updatedCartItems = this.cart.items.filter(item => {
//             return item.productId.toString() !== productId.toString()
//         })
//         return db.collection('users').updateOne({_id:new ObjectId(this._id)}, {$set: {cart:{items: updatedCartItems}}})
//     }

//     addOrder() {
//         const db = getDB()
//         return this.getCart()
//             .then(products => {
//                 const order = {
//                     items: products,
//                     user: {
//                         _id: new ObjectId(this._id),
//                         username: this.username
//                     }
//                 }
//                 return db.collection('orders').insertOne(order)
//             })
//             .then(() => {
//                 this.cart = {items: []}
//                 return db.collection('users').updateOne({_id:new ObjectId(this._id)}, {$set: {cart: {items: []}}})
//             })
//     }

//     getOrders() {
//         const db = getDB()
//         return db.collection('orders').find({'user._id': new ObjectId(this._id)}).toArray()
//     }

//     static findById(userId) {
//         const db = getDB()
//         return db.collection('users').findOne({_id: new ObjectId(userId)}).catch(err => console.log(err))
//     }
// }

// module.exports = User;