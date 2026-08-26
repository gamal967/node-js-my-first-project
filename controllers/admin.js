

const Product = require('../models/product');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const fileHelper = require('../util/file');




exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        docTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false, // ✅ false because this is Add page
        product: {},     // ✅ empty object so Pug doesn't crash
        validationError: [],
        errorMessage: false,
        oldInputs: {
            title: '',
            imageUrl: '',
            price: '',
            description: ''
        }
        
    });
}



exports.postAddProduct=(req,res,next)=>{
    const title=req.body.title;
    const image=req.file;
    const price=req.body.price;
    const description=req.body.description;
    const errors = validationResult(req);
    // console.log(imageUrl);

    if(!image){
        return res.status(422).render('admin/edit-product', {
            docTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false, // ✅ false because this is Add page
            product: {},     // ✅ empty object so Pug doesn't crash
            validationError: [],
            errorMessage: 'Attached file is not an image',
            oldInputs: {
                title: title,
                price: price,
                description: description
            }
        })
    }


    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('admin/edit-product', {
            docTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false, // ✅ false because this is Add page
            product: {},     // ✅ empty object so Pug doesn't crash
            validationError: errors.array(),
            errorMessage: errors.array()[0].msg,
            oldInputs: {
                title: title,
                imageUrl: imageUrl,
                price: price,
                description: description
            }
            
        });
    }

    const imageUrl=image.path;

    const product =new Product({
        // _id: new mongoose.Types.ObjectId('6a42982d0b0bfdf1943ed722'),
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user
    });
    product.save()
    .then(()=>{
        // console.log(result);
        console.log('Created Product');
        res.redirect('/');
        
        
    })
    .catch(err=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}
exports.getEditProduct=(req, res, next) => {
    const editMode=req.query.edit;
    if(!editMode){
        return res.redirect('/');
        
    }
    const prodId = req.params.productId;
    // req.user.getProducts({where: {id: prodId}})
    // console.log(prodId);
    
    Product.findById(prodId)
    .then(result=>{
        if (!result) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            docTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: result,
            validationError: [],
            errorMessage: false,
            oldInputs: {
                title: result.title,
                imageUrl: result.imageUrl,
                price: result.price,
                description: result.description
            }
        });
    })
    .catch(err=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
    
}

exports.postEditProduct=(req, res, next) => {
    const prodId=req.body.productId;
    const updatedTitle=req.body.title;
    const image=req.file;
    const updatedDescription=req.body.description;
    const updatedPrice=req.body.price;
    // console.log(prodId);   
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('admin/edit-product', {
            docTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            product: {
                _id: prodId,
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDescription
            },
            validationError: errors.array(),
            errorMessage: errors.array()[0].msg,
            oldInputs: {
                title: updatedTitle,
                imageUrl: updatedImageUrl,
                price: updatedPrice,
                description: updatedDescription
            }
        });
    }

        

    Product.findById(prodId)
        .then(product=>{
            const userId=req.user._id;
            if(product.userId.toString()!==userId.toString()){
                return res.redirect('/');
            };

            product.title=updatedTitle;
            product.price=updatedPrice;
            product.description=updatedDescription;
            if(image){
                fileHelper.deleteFile(product.imageUrl);
                product.imageUrl=image.path;
            }
            return product.save()
            .then(()=>{
            console.log('Updated Product');
            res.redirect('/admin/products');
            })
            .catch(err=>console.log(err));
        })
        
        .catch(err=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.getProducts=(req, res, next) => {
    // req.user.getProducts()
    const userId=req.user._id;
    Product.find({userId,userId})
    // .populate('userId')
    .then(result=>{
        // console.log(result);
        res.render('admin/products', {
        prods: result,
        docTitle: 'Admin Products',
        path: '/admin/products',
        
        
        });
    })
    .catch(err=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
    
}

// Delete product
exports.deleteProduct=(req, res, next) => {
    const prodId=req.params.productId;
    // req.user.destroy({where: {id: prodId}}) with MySQL
    Product.findById(prodId)
    .then(product=>{
        if(!product){
            return next(new Error('Product not found'));
        }
        fileHelper.deleteFile(product.imageUrl);
        return Product.deleteOne({_id: prodId , userId: req.user._id})
    })
    .then(()=>{

        console.log('Deleted Product');
        res.status(200).json({message: 'Success!'});
    })
    .catch(err=>{
        res.status(500).json({message: 'Deleting product failed!'});
    });
    
}