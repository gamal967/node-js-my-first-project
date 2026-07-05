

const express =require('express');
const router =express.Router();



const adminController =require('../controllers/admin');
// /admin/add-product => GET
router.get('/add-product',adminController.getAddProduct); 

// // /admin/products => GETX
router.get('/products',adminController.getProducts);

// // /admin/product => POST
router.post('/product',adminController.postAddProduct);

router.get('/edit-product/:productId',adminController.getEditProduct);

router.post('/edit-product',adminController.postEditProduct);

router.post('/delete-product',adminController.postDeleteProduct);    




module.exports =router;
