
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const Order = require('../models/order');


const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true    
    },
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ]
    }
    
})
userSchema.methods.addToCart=function(product){

    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity,
        });
    }
    const updatedCart = {
        items: updatedCartItems
    };


    this.cart = updatedCart;
    return this.save()
}

userSchema.methods.removeFromCart=function(prodId){
        const updatedCartItems=this.cart.items.filter(p=>{
            return p.productId._id.toString()!==prodId.toString()
        });
        this.cart.items=updatedCartItems;
        return this.save();
}

userSchema.methods.clearCart=function(){
    this.cart={items:[]}; // clean up the existing cart
    return this.save();
}
userSchema.methods.fetchOrders=function(){
    return Order.find({'user.userId':this._id})
}

userSchema.methods.totalOrders=function(){
    return this.fetchOrders()
    .then(orders => {
        return orders.length;
    });
}


module.exports = mongoose.model('User', userSchema);
// const getDb = require('../util/DB').getDb;
// const mongodb = require('mongodb');


// class User {
//     constructor(_id, userName, email, cart) {
//         this._id = new mongodb.ObjectId(_id);
//         this.userName = userName;
//         this.email = email;
//         this.cart = cart; //object {items:[]}
//     }
//     save() {
//         const db = getDb();

//         //insert
//         return db.collection('users')
//             .insertOne(this)
//             .then(user => {
//                 // console.log(user);
//                 return user;
//             })
//             .catch(err => console.log(err));
//     }

//     addToCart(product) {
//         const db = getDb();

//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() === product._id.toString();
//         });

//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];
//         if (cartProductIndex >= 0) {
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;

//         } else {
//             updatedCartItems.push({
//                 productId: product._id,
//                 quantity: newQuantity,
//             });
//         }
//         const updatedCart = {
//             items: updatedCartItems
//         };

//         return db.collection('users')
//             .updateOne(
//                 { _id: this._id },
//                 { $set: { cart: updatedCart } }
//             )
//     }
//     static findById(userId) {
//         const db = getDb();
//         return db.collection('users')
//             .findOne({ _id: new mongodb.ObjectId(userId) })
//             .then(user => {
//                 // console.log(user);
//                 return user;
//             })
//             .catch(err => console.log(err));
//     }


//     fetchCart() {
//         const db = getDb();
//         const productIds = this.cart.items.map(i => {
//             return i.productId;
//         })
//         return db
//             .collection('products')
//             .find({ _id: { $in: productIds } })
//             .toArray()
//             .then(products => {
//                 // Filter cart items to only include products that exist in DB
//                 const validCartItems = this.cart.items.filter(cartItem => {
//                     return products.some(p => p._id.toString() === cartItem.productId.toString());
//                 });

//                 // Update cart in database with only valid items
//                 return db.collection('users')
//                     .updateOne(
//                         { _id: this._id },
//                         { $set: { cart: { items: validCartItems } } }
//                     )
//                     .then(() => products); // Return products after update completes
//             })
//             .then(products => {
//                 // Map products with their quantities from cart
//                 return products.map(p => {
//                     return {
//                         ...p,
//                         quantity: this.cart.items.find(i => {
//                             return i.productId.toString() === p._id.toString();
//                         }).quantity
//                     }
//                 })
//             })
//             .catch(err => console.log(err));
//     }
//     addOrder(){
//         const db=getDb();
//         return this.fetchCart().then(products=>{
//             const order ={
//                 items: products,
//                 user:{
//                     _id: new mongodb.ObjectId(this._id),
//                     name:this.userName
//                 }
//             };
            
//             return db.collection('orders')
//             .insertOne(order);

//         }).then(()=>{
//             this.cart={items:[]}; // clean up the existing cart
//             return db.collection('users')
//             .updateOne(
//                 { _id: this._id },
//                 { $set: { cart: { items: [] } } }
//             )
//         })
//         .catch(err=>console.log(err));
//     }
//     fetchOrders(){
//         const db =getDb();
//         return db
//             .collection('orders')
//             .find({"user._id": new mongodb.ObjectId(this._id)})
//             .toArray();
//     }
    
//     deleteById(prodId){
//         const updatedCartItems = this.cart.items.filter(item=>{
//             return item.productId.toString() !== prodId.toString();
//         })
//         const db = getDb();
//         return db.collection('users')
//             .updateOne(
//                 { _id: this._id },
//                 { $set: { cart: { items: updatedCartItems } } }
//             )
//     }
// }



// module.exports = User;