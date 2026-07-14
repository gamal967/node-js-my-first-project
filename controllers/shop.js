

const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const { or } = require('sequelize');





exports.getProducts = (req, res, next) => {
    Product.find()
    .then(products=>{
        res.render('shop/product-list', {
            prods: products,
            docTitle: 'Shop',
            path: '/products',
            isAu: req.session.isloggedIn,
        });

    })
    .catch(err=>console.log(err));
};



exports.getIndex = (req, res, next) => {
    Product.find()
    .then(products=>{
        res.render('shop/index', {
            prods: products,
            docTitle: 'Shop',
            path: '/',
            isAu: req.session.isloggedIn,
        });

    })
    .catch(err=>console.log(err));
    
};

exports.getCart=(req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user=>{
            const products=user.cart.items;
            res.render('shop/cart', {
                docTitle: 'Your Cart',
                path: '/cart',
                products: products,
                isAu: req.session.isloggedIn,
            });
        })
        .catch(err=>console.log(err)); 
    
    
};

exports.postCart=(req, res, next) => {

    const prodId=req.body.productId;
    if(req.session.isloggedIn){
        Product.findById(prodId)
        .then(product=>{
            return req.user.addToCart(product);
        })
        .then(result=>{
            //AI{
            req.session.flashMessage = {
                type: 'success',
                text: 'Added to cart!'
            };
            return req.session.save(err => {
                if (err) console.log(err);
                //}
                return res.redirect('/cart');
            });
        })
        .catch(err=>console.log(err));
    }
    else{
        //AI{
        req.session.flashMessage = {
            type: 'error',
            text: 'You should login first.'
        };
        return req.session.save(err => {
            if (err) console.log(err);
            //}
            res.redirect('/login');
        });
    }
}

exports.postCartDelete=(req, res, next) => {
    const prodId = req.body.productId;
    req.user
    .removeFromCart(prodId)
    .then(()=>{
        res.redirect('/cart');
    })
    .catch(err=>console.log(err));
    
};



exports.getDetails=(req, res, next) => {
    const prodId=req.params.productId;
    Product.findById(prodId)   
    .then(result=>{
        res.render('shop/product-detail', {
                product: result,
                docTitle: result.title,
                path: '/products',
                isAu: req.session.isloggedIn,
            });
    })
    .catch(err=>console.log(err));
    
};

exports.getOrders=(req, res, next) => {
    req.user.fetchOrders()
    .then((orders)=>{
        req.user.totalOrders()
        .then(totalOrders=>{
            res.render('shop/order', {
                docTitle: 'Your Orders',
                path: '/orders',
                orders: orders,
                totalOrders: totalOrders,
                isAu: req.session.isloggedIn,
            });
        })
    })
    .catch(err=>console.log(err));
}


exports.postOrder=(req, res, next) => {
    req.session.user
        .populate('cart.items.productId')
        .then(user=>{
            const products=user.cart.items.map(i=>{
                return{quantity: i.quantity, product:i.productId.toObject()}
            });
            const order=new Order({
                user: {
                    name: req.session.user.name,
                    userId: req.session.user
                },
                products: products
            })
            return (order.save(), user.clearCart());

        })
        .then(result=>{
            console.log("Order Placed");
            res.redirect('/orders');
            
        })
        .catch(err=>console.log(err));

        
    
}


