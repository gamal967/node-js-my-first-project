
const e = require('express');
const Product=require('../models/product');
const Cart=require('../models/cart');




exports.getProducts=(req, res, next) => {
    Product.fetchAll((products)=>{
        res.render('shop/product-list', {
        prods: products,
        docTitle: 'All Products',
        path: '/products',
    });
    });
    
}

exports.getIndex=(req, res, next) => {
    Product.fetchAll((products)=>{
        res.render('shop/index', {
        prods: products,
        docTitle: 'Shop',
        path: '/',
    });
    });
    
}

exports.getCart=(req, res, next) => {
    Cart.getCart(cart=>{
        const cartProducts=[];
        Product.fetchAll(products=>{
            for(let product of products){
                const cartProductData=cart.products.find(prod=>prod.id===product.id);
                if(cartProductData){
                    cartProducts.push({productData : product, qty: cartProductData.qty});
                }
            }
            res.render('shop/cart', {
                docTitle: 'Your Cart',
                path: '/cart',
                products: cartProducts,
            });
        });
    });
    
};

exports.postCart=(req, res, next) => {
    const productId=req.body.productId;
    console.log(productId);
    Product.findById(productId,(product)=>{
        Cart.addProduct(productId,product.price);
    });
    res.redirect('/cart');
}

exports.postCartDelete=(req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId, product => {
    Cart.deleteById(prodId, product.price);
    res.redirect('/cart');
    });
};

exports.getOrders=(req, res, next) => {
    res.render('shop/order', {
        docTitle: 'Your Orders',
        path: '/orders',
    });
    
}

exports.getCheckout=(req, res, next) => {
    res.render('shop/checkout', {
        docTitle: 'Checkout',
        path: '/checkout',
    });
    
}
exports.getDetails=(req, res, next) => {
    const productId=req.params.productId;
    Product.findById(productId,(product)=>{
        res.render('shop/product-detail', {
            product: product,
            docTitle: product.title,
            path: '/products',
        });
    });
}



