
const express= require('express');
const router =express.Router();

const shopController =require('../controllers/shop');   

router.get('/',shopController.getIndex); 


router.get('/products',shopController.getProducts);

router.get('/cart',shopController.getCart);

router.post('/cart',shopController.postCart);

router.post('/cart-delete-item',shopController.postCartDelete);

router.post('/create-order',shopController.postOrder);

router.get('/orders',shopController.getOrders);



router.get('/product/:productId',shopController.getDetails);



module.exports = router; 


