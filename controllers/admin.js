
const product = require('../models/product');
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
    const product =new Product({
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
    .catch(err=>console.log(err));
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
            product: result
        });
    })
    .catch(err=>console.log(err));
    
}

exports.postEditProduct=(req, res, next) => {
    const prodId=req.body.productId;
    const updatedTitle=req.body.title;
    const updatedImageUrl=req.body.imageUrl;
    const updatedDescription=req.body.description;
    const updatedPrice=req.body.price;
    // console.log(prodId);    

    Product.findById(prodId)
        .then(product=>{
            product.title=updatedTitle;
            product.price=updatedPrice;
            product.description=updatedDescription;
            product.imageUrl=updatedImageUrl;
            return product.save();
        })
        .then(()=>{
            console.log('Updated Product');
            res.redirect('/admin/products');
        })
        .catch(err=>console.log(err));
}

exports.getProducts=(req, res, next) => {
    // req.user.getProducts()
    Product.find()
    // .select('title price')
    // .populate('userId', 'name')
    .then(result=>{
        // console.log(result);
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
    // req.user.destroy({where: {id: prodId}}) with MySQL
    Product.findByIdAndDelete(prodId) // with MongoDB
    .then(()=>{

        console.log('Deleted Product');
        res.redirect('/admin/products');
    })
    .catch(err=>console.log(err));
    
}