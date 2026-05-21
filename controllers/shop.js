

const Product = require('../models/product');
const { where } = require('sequelize');




exports.getProducts = async (req, res, next) => {
    Product.findAll()
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
    Product.findAll()
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
    req.user.getCart()
    .then(cart=>{
        return cart.getProducts()
            .then(products=>{
                res.render('shop/cart', {
                    docTitle: 'Your Cart',
                    path: '/cart',
                    products: products,
                });
            })
            .catch(err=>console.log(err));
    })
    .catch(err=>console.log(err));
    
};

exports.postCart=(req, res, next) => {
    const prodId=req.body.productId;
    let fetchCart;
    let newQuantity=1;
    req.user
    .getCart()
    .then(cart=>{
        fetchCart=cart;
        return cart.getProducts({where:{id:prodId}})
        
    })
    .then(products=>{
        let product;
        if(products.length>0){
            product=products[0];

        }
        if(product){
            //...
            const oldQuantity=product.cartItem.quantity;
            newQuantity=oldQuantity+1;
            return product;
        }
        return Product.findByPk(prodId)
    })
    .then(product=>{
        return fetchCart.addProduct(product, {
            through: {
                quantity: newQuantity
            } 
        })
    })
    
    .then(()=>{
        res.redirect("/cart");
    })

    .catch(err=>console.log(err));
}

exports.postCartDelete=(req, res, next) => {
    const prodId = req.body.productId;
    req.user.getCart()
    .then(cart=>{
        return cart.getProducts({where:{id:prodId}})
    })
    .then(products=>{
        const product=products[0];
        return product.cartItem.destroy();
    })
    .then(()=>{
        res.redirect('/cart');
    })
    .catch(err=>console.log(err));
    
};

exports.getOrders=(req, res, next) => {
    req.user.getOrders({include: ['products']})
    .then(orders=>{
        res.render('shop/order', {
            docTitle: 'Your Orders',
            path: '/orders',
            orders: orders,
        });
    })
    .catch(err=>console.log(err));
    
}


exports.getDetails=(req, res, next) => {
    const productId=req.params.productId;
    Product.findOne({where: {id: productId}})
    .then(result=>{
        res.render('shop/product-detail', {
                product: result,
                docTitle: result.title,
                path: '/products',
            });
    })
    .catch(err=>console.log(err));
    
};

exports.postOrder=(req, res, next) => {
    let fetchCart;
    req.user
        .getCart()
        .then(cart=>{
            fetchCart=cart;
            return cart.getProducts();

        })
        .then(products=>{
            return req.user
                .createOrder()
                .then(order=>{
                    return order.addProducts(products.map(product=>{
                        product.orderItem={quantity: product.cartItem.quantity};
                        return product;
                    })
                );
                })
                .then(result=>{
                    return fetchCart.setProducts(null);
                })
                .then(result=>{
                    res.redirect('/orders');
                    
                })
                .catch(err=>console.log(err));

        })
        .catch(err=>console.log(err));
    
}


