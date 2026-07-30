
const User = require("../models/user");

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const { validationResult } = require('express-validator');


const transporter = nodemailer.createTransport(sendgrid({
    auth: {
        api_key: process.env.SENDGRID_API_KEY
    }
}));
// console.log(process.env.SENDGRID_API_KEY);
// console.log(process.env.SENDGRID_API_KEY);
exports.getLogin = (req, res, next) => {
    // const isloggedIn = req
    //     .get('Cookie')
    //     .trim()
    //     .split('=')[1]==='true';
    console.log(req.session.isloggedIn);
    res.render('auth/login', {
        docTitle: 'Login',
        path: '/login',
        errorMessage: req.flash('error'),
        validationError: [],
        oldInputs: {
            email: '',
        }
        
    });
    
};

exports.postLogin = (req, res, next) => {
    const email =req.body.email;
    const password =req.body.password;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('auth/login', {
            docTitle: 'Login',
            path: '/login',
            errorMessage: errors.array()[0].msg,
            validationError: errors.array(),
            oldInputs: {
                email: email,
            }
        });
    }

    User.findOne({email: email})
    .then(user=>{
    // i put the email validation in route not in controller
        bcrypt
            .compare(password, user.password)
            .then(doMatch=>{
                if(doMatch){
                    req.session.isloggedIn = true;
                    req.session.user = {
                        _id: user._id.toString(),
                        email: user.email,
                        

                    }; 
                    
                    return req.session.save(err => {
                        if (err) console.log(err);
                        return res.redirect('/');
                    });
                }
                return res.status(422).render('auth/login', {
                    docTitle: 'Login',
                    path: '/login',
                    errorMessage: 'Your email or password is incorrect!',
                    validationError: errors.array(),
                    oldInputs: {
                        email: email,
                    }
                })
            })
            .catch(err=>{
                console.log(err)
                res.redirect('/login')
            });
    })
    .catch(err=>console.log(err));

};
exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
    if (err) {
        return console.log(err);
    }

    res.clearCookie('connect.sid');
    res.redirect('/');
    });

};

exports.getSignup = (req, res, next) => {

    
    res.render('auth/sign_up', {
        docTitle: 'Signup',
        path: '/signup',
        errorMessage: req.flash('error'),
        oldInputs: {
            email: '',
        },
        validationError: []

    });
    
};

exports.postSignup = (req, res, next) => {
    const email =req.body.email;
    const password =req.body.password;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('auth/sign_up', {
            docTitle: 'Signup',
            path: '/signup',
            errorMessage: errors.array()[0].msg,
            oldInputs: {
                email: email,
            },
            validationError: errors.array()
        })
    }
        bcrypt
            .hash(password, 12)
            .then(hashedPassword=>{
                const newUser= new User({
                    email: email,
                    password: hashedPassword,
                    cart: {items: []}
                })
                return newUser.save()

            })
            .then(() => {
                return transporter.sendMail({
                    to: email,
                    from: 'gh1227@fayoum.edu.eg',
                    subject: 'Signup succeeded',
                    html: '<h1>You successfully signed up!</h1>'
                });
            })
            .then((info) => {

                console.log('Email sent:', info);
                res.redirect('/login');

            })
            .catch(err=>{
                console.log(err);
                res.redirect('/signup');
            })
};

exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        docTitle: 'Reset Password',
        path: '/reset',
        errorMessage: req.flash('error'),
        
    });
};

exports.getChechEmail = (req, res, next) => {
    res.render('auth/check-email', {
        docTitle: 'Check Email',
        path: '/check-email',
        errorMessage: req.flash('error'),
        
    });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err){
            console.log(err);
            return res.redirect('/reset');
        }
        const token =buffer.toString('hex');
        User.findOne({email: req.body.email})
            .then(user=>{
                if(!user){
                    req.flash('error', 'No account with that email found.');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save()
                    .then(() => {
                        res.redirect('/chech-email');
                        transporter.sendMail({
                            to: req.body.email,
                            from: 'gh1227@fayoum.edu.eg',
                            subject: 'Password Reset',
                            html: `
                                <p>You requested a password reset</p>
                                <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                            `
                        });
                    })
                    .catch(err=>console.log(err));
            })
            .catch(err=>console.log(err));
    })
};

exports.getNewPassword= (req, res, next) => {
    const token =req.params.token;
    User.findOne({resetToken: token ,resetTokenExpiration: {$gt : Date.now()}})
        .then(user=>{
            if(!user){
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('/reset');
            }
            res.render('auth/new-password', {
                docTitle: 'New Password',
                path: '/new-password',
                errorMessage: req.flash('error'),
                userId: user._id.toString(),
                passwordToken: token
        
            });
        })
        .catch(err=>console.log(err));
}

exports.postNewPassword=(req, res, next) => {
    const newPassword=req.body.password;
    const userId= req.body.userId;
    const passwordToken=req.body.passwordToken
    let resetUser;
    User.findOne({resetToken: passwordToken ,resetTokenExpiration: {$gt : Date.now()}, _id: userId})
        .then(user=>{
            resetUser=user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword=>{
            resetUser.password=hashedPassword;
            resetUser.resetToken=undefined;
            resetUser.resetTokenExpiration=undefined;
            return resetUser.save();
        })
        .then(result=>{
            res.redirect('/login');
        })
        .catch(err=>console.log(err));
}