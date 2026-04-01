
const e = require('express');
const Product=require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        docTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false, // ✅ false because this is Add page
        product: {}     // ✅ empty object so Pug doesn't crash
    });
}



exports.postAddProduct=(req,res,next)=>{
    const title=req.body.title;
    const imageUrl=req.body.imageUrl;
    const price=req.body.price;
    const description=req.body.description;
    const products=new Product(title, imageUrl, price, description);
    products.save();
    res.redirect('/');
}
exports.getEditProduct=(req, res, next) => {
    const editMode=req.query.edit;
    // if(!editMode){
    //     return res.redirect('/');
        
    // }
    const prodId = req.params.productId;
    Product.findById(prodId, product => {
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            docTitle: 'Edit Product',
            path: '/admin/edit-product',
            // editing: editMode,
            editing: true,
            product: product
        });
    });
}

exports.getProducts=(req, res, next) => {
    Product.fetchAll((products)=>{
        res.render('admin/products', {
        prods: products,
        docTitle: 'Admin Products',
        path: '/admin/products',
    });
    });
    
}