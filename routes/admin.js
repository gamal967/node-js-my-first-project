

const productController =require('../controllers/products');
const express =require('express');
const router =express.Router();



// /admin/add-product => GET
router.get('/add-product',productController.getAddProduct); 

// /admin/product => POST
router.post('/product',productController.postProduct);

module.exports =router;
