const express =require('express');
const router =express.Router();
const authController =require('../controllers/auth');
const { check ,body} = require('express-validator');
const User = require('../models/user');


router.get('/login',authController.getLogin);
router.post('/login',
        body('email').isEmail().trim().normalizeEmail().withMessage('Please enter a valid email address')
        .custom((value, { req }) => {
            return User.findOne({email: value})
                .then(user=>{
                    if(!user){
                        return Promise.reject('Your email or password is incorrect!');
                    }
            })
        }),
        body('password', 'Please enter a password with only numbers and text and at least 5 characters')
            .trim()
            .isLength({min: 5})
            .isAlphanumeric(),
        authController.postLogin);

router.post('/logout',authController.postLogout);

router.get('/signup',authController.getSignup);
router.post(
        '/signup',
        check('email')
            .isEmail()
            .withMessage('this is not a valid email')
            .custom((value, { req }) => {
                // if(value === 'GeMe@example.com') {
                //     throw new Error('this email is forbidden');
                // }
                // return true;
                return User.findOne({email: value})
                        .then((user)=>{
                            if(user){
                                return Promise.reject('Email already exists!');           
                            }       
                        });
                    })
            .normalizeEmail(),
            body(
                'password',
                'Enter a password with only numbers and text and at least 5 characters')
                    .trim()
                    .isLength({min: 5})
                    .isAlphanumeric(),
            body('confirmPassword').trim().custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords have to match');
                }
                return true;
            }),
        authController.postSignup);

router.get('/reset',authController.getReset);
router.get('/chech-email',authController.getChechEmail);
router.post('/reset',authController.postReset);
router.get('/reset/:token',authController.getNewPassword);
router.post('/new-password',authController.postNewPassword);

module.exports =router;