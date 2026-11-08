

const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const PDF = require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const ITEM_PER_PAGE = 2;


exports.getProducts = (req, res, next) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    let totalItems;

    Product.find()
        .countDocuments()
        .then(numProducts=>{
            totalItems=numProducts;
            return Product.find()
                .skip((page-1)*ITEM_PER_PAGE)
                .limit(ITEM_PER_PAGE);
        })
        .then(products=>{
            res.render('shop/product-list', {
                prods: products,
                docTitle: 'Shop',
                path: '/products',
                currentPage: page,
                totalItems: totalItems,
                hasNextPage: ITEM_PER_PAGE*page<totalItems,
                hasPreviousPage: page>1,
                nextPage: page+1,
                previousPage: page-1,
                lastPage: Math.ceil(totalItems/ITEM_PER_PAGE)
            });

        })
        .catch(err=>{
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};



exports.getIndex = (req, res, next) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    let totalItems;

    Product.find()
        .countDocuments()
        .then(numProducts=>{
            totalItems=numProducts;
            return Product.find()
                .skip((page-1)*ITEM_PER_PAGE)
                .limit(ITEM_PER_PAGE);
        })
        .then(products=>{
            res.render('shop/index', {
                prods: products,
                docTitle: 'Shop',
                path: '/',
                currentPage: page,
                totalItems: totalItems,
                hasNextPage: ITEM_PER_PAGE*page<totalItems,
                hasPreviousPage: page>1,
                nextPage: page+1,
                previousPage: page-1,
                lastPage: Math.ceil(totalItems/ITEM_PER_PAGE)
            });

        })
        .catch(err=>{
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    
};

exports.getCart=(req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user=>{
            const products=user.cart.items.filter(item=>item.productId);
            res.render('shop/cart', {
                docTitle: 'Your Cart',
                path: '/cart',
                products: products,
                
            });
        })
        .catch(err=>{
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        }); 
    
    
};

exports.postCart=(req, res, next) => {

    const prodId=req.body.productId;
    if(req.session.isloggedIn){
        Product.findById(prodId)
        .then(product=>{
            if(!product){
                return res.redirect('/products');
            }
            return req.user.addToCart(product);
        })
        .then(result=>{
            return res.redirect('/cart');
        })
        .catch(err=>{
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    }
    else{
        return res.redirect('/login');
    }
}

exports.postCartDelete=(req, res, next) => {
    const prodId = req.body.productId;
    req.user
    .removeFromCart(prodId)
    .then(()=>{
        res.redirect('/cart');
    })
    .catch(err=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
    
};



exports.getDetails=(req, res, next) => {
    const prodId=req.params.productId;
    Product.findById(prodId)   
    .then(result=>{
        if(!result){
            return res.status(404).render('404', {
                docTitle: 'Not Found',
                path: '/404'
            });
        }
        res.render('shop/product-detail', {
                product: result,
                docTitle: result.title,
                path: '/products',
                
            });
    })
    .catch(err=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
    
};

exports.getCheckout=(req, res, next) => {
    let products;
    let total=0;
    req.user
        .populate('cart.items.productId')
        .then(user=>{
            products=user.cart.items.filter(item=>item.productId);
            total=0;
            if(products.length===0){
                return null;
            }
            products.forEach(p=>{
                total+=p.quantity*p.productId.price
            })
            return stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: products.map(p=>{
                    return {
                        price_data:{
                            currency: 'usd',
                            product_data:{
                                name: p.productId.title,
                                description: p.productId.description
                            },
                            unit_amount: p.productId.price*100
                        },
                        quantity: p.quantity
                    }
                }),
                mode: 'payment',
                success_url: req.protocol+'://'+req.get('host')+'/checkout/success',
                cancel_url: req.protocol+'://'+req.get('host')+'/checkout/cancel'
            });
        })
        .then(session=>{
            if(!session){
                return res.redirect('/cart');
            }
            res.render('shop/checkout', {
                docTitle: 'Checkout',
                path: '/checkout',
                products: products,
                totalSum: total,
                sessionId: session.id,
                publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
            });
        })
        .catch(err=>{
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getOrders=(req, res, next) => {
    req.user.fetchOrders()
    .then((orders)=>{
        return req.user.totalOrders()
        .then(totalOrders=>{
            res.render('shop/order', {
                docTitle: 'Your Orders',
                path: '/orders',
                orders: orders,
                totalOrders: totalOrders,
                
            });
        })
    })
    .catch(err=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}


exports.postOrder=(req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user=>{
            const products=user.cart.items
                .filter(i=>i.productId)
                .map(i=>{
                    return{quantity: i.quantity, product:i.productId.toObject()}
                });
            const order=new Order({
                user: {
                    email: req.session.user.email,
                    userId: req.session.user
                },
                products: products
            })
            // Save the order first, then empty the cart.
            return order.save().then(()=>user.clearCart());

        })
        .then(result=>{
            console.log("Order Placed");
            res.redirect('/orders');
            
        })
        .catch(err=>{
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

        
    
}

exports.getInvoice=(req,res,next)=>{
    const orderId=req.params.orderId;
    Order.findById(orderId)
        .then(order=>{
            if(!order){
                return next(new Error('No order found'));
            }
            if(order.user.userId.toString()!==req.user._id.toString()){
                return next(new Error('Unauthorized'));
            }
            const invoiceName=`invoice-${orderId}.pdf`;

            const pdfDoc = new PDF();
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="'+invoiceName+'"');

            // Stream straight to the response: no temp file, works on
            // hosts with an ephemeral filesystem.
            pdfDoc.pipe(res);

            pdfDoc.fontSize(26).text('The Invoice', {
                underline: true
            });

            let totalPrice=0;
            order.products.forEach(prod=>{
                totalPrice+=prod.quantity*prod.product.price;
                pdfDoc.fontSize(14).text(prod.product.title+' - '+prod.quantity+' x $'+prod.product.price);
            });
            pdfDoc.fontSize(20).text('Total Price: $'+totalPrice);
            
            pdfDoc.end();

            
        })
        .catch(err=>{
            next(err);
        })
    
};


