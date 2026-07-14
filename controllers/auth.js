const User = require("../models/user");


exports.getLogin = (req, res, next) => {
    // const isloggedIn = req
    //     .get('Cookie')
    //     .trim()
    //     .split('=')[1]==='true';
    console.log(req.session.isloggedIn);
    res.render('auth/login', {
        docTitle: 'Login',
        path: '/login',
        isAu: false,
    });
    
};

exports.postLogin = (req, res, next) => {
    User.findById('6a42938159890bb50d44b632')
    .then(user=>{
        req.session.isloggedIn = true;
        req.session.user = {
            _id: user._id.toString(),
            name: user.name,
            email: user.email
        }; 
        req.session.save(err => {
            console.log(err);
            res.redirect('/');
        })
        
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