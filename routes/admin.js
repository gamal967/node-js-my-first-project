

const express =require('express');
const router =express.Router();



const adminController =require('../controllers/admin');
// /admin/add-product => GET
router.get('/add-product',adminController.getAddProduct); 

// /admin/add-product => GETX
router.get('/products',adminController.getProducts);

// /admin/product => POST
router.post('/product',adminController.postAddProduct);

router.get('/edit-product/:productId',adminController.getEditProduct);

module.exports =router;
