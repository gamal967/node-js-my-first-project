

const Product = require('../models/product');
const User = require('../models/user');
const { where } = require('sequelize');




exports.getProducts = (req, res, next) => {
    Product.fetchAll()
    .then(products=>{
        res.render('shop/product-list', {
            prods: products,
            docTitle: 'Shop',
            path: '/products',
        });

    })
    .catch(err=>console.log(err));
};



exports.getIndex = async (req, res, next) => {
    Product.fetchAll()
    .then(products=>{
        res.render('shop/index', {
            prods: products,
            docTitle: 'Shop',
            path: '/',
        });

    })
    .catch(err=>console.log(err));
    
};

exports.getCart=(req, res, next) => {
    req.user
        .fetchCart()
        .then(products=>{
            res.render('shop/cart', {
                docTitle: 'Your Cart',
                path: '/cart',
                products: products,
            });
        })
        .catch(err=>console.log(err));
    
    
};

exports.postCart=(req, res, next) => {

    const prodId=req.body.productId;
    Product.findById(prodId)
    .then(product=>{
        return req.user.addToCart(product);
    })
    .then(result=>{
        console.log(result);
        // console.log('Added to cart');
        return res.redirect('/cart');
    })
    .catch(err=>console.log(err));
}

exports.postCartDelete=(req, res, next) => {
    const prodId = req.body.productId;
    req.user.deleteById(prodId)
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
            });
    })
    .catch(err=>console.log(err));
    
};

exports.getOrders=(req, res, next) => {
    req.user.fetchOrders()
    .then(orders=>{
        res.render('shop/order', {
            docTitle: 'Your Orders',
            path: '/orders',
            orders: orders,
        });
    })
    .catch(err=>console.log(err));
}


exports.postOrder=(req, res, next) => {
    
    req.user
        .addOrder()
        .then(result=>{
            res.redirect('/orders');
            
        })
        .catch(err=>console.log(err));

        
    
}


