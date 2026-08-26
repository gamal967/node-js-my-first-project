
const { check ,body} = require('express-validator');
const express =require('express');
const router =express.Router();

const adminController =require('../controllers/admin');
const isAuth =require('../middleware/is-auth');


// /admin/add-product => GET
router.get('/add-product'
    , isAuth
    , adminController.getAddProduct); 

// // /admin/product => POST
router.post('/product'
    ,[
        body('title')
            .isString()
            .isLength({min:2})
            .trim()
            .withMessage('Title must be at least 2 characters long')
        
        ,body('price')
            .isFloat({ min: 0.01 })
            .trim()
            .withMessage('Price must be a positive number')
        ,body('description')
            .trim()
            .isLength({min:5, max:400})
            .withMessage('Description must be at least 5 characters long')
    ]
    ,isAuth
    ,adminController.postAddProduct);


// // /admin/products => GETX
router.get('/products', isAuth,adminController.getProducts);


router.get('/edit-product/:productId',isAuth,adminController.getEditProduct);

router.post('/edit-product'
    ,[
        body('title')
            .isString()
            .isLength({min:2})
            .trim()
            .withMessage('Title must be at least 2 characters long')
        
        ,body('price')
            .isFloat({ min: 0.01 })
            .trim()
            .withMessage('Price must be a positive number')
        ,body('description')
            .trim()
            .isLength({min:5, max:400})
            .withMessage('Description must be at least 5 characters long')
    ]
    ,isAuth
    ,adminController.postEditProduct);

router.delete('/product/:productId',isAuth,adminController.deleteProduct);




module.exports =router;
