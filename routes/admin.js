

const express =require('express');
const router =express.Router();

const adminController =require('../controllers/admin');
const isAuth =require('../middleware/is-auth');


// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct); 

// // /admin/products => GETX
router.get('/products', isAuth,adminController.getProducts);

// // /admin/product => POST
router.post('/product',isAuth,adminController.postAddProduct);

router.get('/edit-product/:productId',isAuth,adminController.getEditProduct);

router.post('/edit-product',isAuth,adminController.postEditProduct);

router.post('/delete-product',isAuth,adminController.postDeleteProduct);    




module.exports =router;
