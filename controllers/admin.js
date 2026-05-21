const { where } = require('sequelize');
const Product = require('../models/product');


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
    req.user.createProduct({
        title:title,
        imageUrl:imageUrl,
        price:price,
        description:description
    })
    .then(result=>{
        // console.log(result);
        console.log('Created Product');
        res.redirect('/admin/products');
        
        
    })
    .catch(err=>console.log(err));
}
exports.getEditProduct=(req, res, next) => {
    const editMode=req.query.edit;
    if(!editMode){
        return res.redirect('/');
        
    }
    const prodId = req.params.productId;
    req.user.getProducts({where: {id: prodId}})
    
    // Product.findOne({where: {id: prodId}})
    .then(results=>{
        const result=results[0];
        if (!result) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            docTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: result
        });
    })
    .catch(err=>console.log(err));
    
}

exports.postEditProduct=(req, res, next) => {
    const prodId=req.body.productId;
    const updatedTitle=req.body.title;
    const updatedImageUrl=req.body.imageUrl;
    const updatedPrice=req.body.price;
    const updatedDescription=req.body.description;
    Product.update(
        {
            title: updatedTitle,
            imageUrl: updatedImageUrl,
            price: updatedPrice,
            description: updatedDescription
        },
        {where: {id: prodId}}
    ).then(result=>{
        console.log('Updated Product');
        res.redirect('/admin/products');
    })
    .catch(err=>console.log(err));
}

exports.getProducts=(req, res, next) => {
    req.user.getProducts()
    // Product.findAll()
    .then(result=>{
        res.render('admin/products', {
        prods: result,
        docTitle: 'Admin Products',
        path: '/admin/products',
        
        });
    })
    .catch(err=>console.log(err));
    
}

// Delete product
exports.postDeleteProduct=(req, res, next) => {
    const prodId=req.body.productId;
    // req.user.destroy({where: {id: prodId}})
    Product.destroy({where: {id: prodId}})
    .then(result=>{
        console.log('Deleted Product');
        res.redirect('/admin/products');
    })
    .catch(err=>console.log(err));
    
}