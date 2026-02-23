exports.getAddProduct=(req, res, next) => {
    res.render('add-product', {
        docTitle: 'Add Product', 
        path: '/admin/add-product',
    });
    
}
const products =[];

exports.postProduct=(req,res,next)=>{
    
    products.push({title: req.body.title});
    res.redirect('/');
}

exports.getProducts=(req, res, next) => {
    res.render('shop', {
        prods: products,
        docTitle: 'Shop',
        path: '/',
    });
}

exports.products=products;

