
require('dotenv').config();
const rootDir =require('./util/path');
const path =require('path');
const express =require('express');
const bodyParser =require('body-parser');   
const errorController=require('./controllers/error');
const adminRoutes =require('./routes/admin'); 
const shopRoute =require('./routes/shop');  
const authRoutes =require('./routes/auth');  
const User =require('./models/user');
const mongoose= require('mongoose');
const session =require('express-session');
const MongoDBStore =require('connect-mongodb-session')(session);
const csrf =require('csurf');
const flash =require('connect-flash');

const MONGODB_URI ='mongodb://gamalelctron2332_db_user:gggmmmlll333@ac-0pastqb-shard-00-00.akdhoiv.mongodb.net:27017,ac-0pastqb-shard-00-01.akdhoiv.mongodb.net:27017,ac-0pastqb-shard-00-02.akdhoiv.mongodb.net:27017/shop?ssl=true&replicaSet=atlas-ogso4t-shard-0&authSource=admin&appName=Cluster0'

const app = express();
// excute mongodb store constructor
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})



app.set('view engine','pug');
app.set('views','views');


//Middlewares
app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static(path.join(rootDir,'public')));

app.use(
    session({
        secret: 'my secret key',
        resave: false,
        saveUninitialized: false,
        store: store
}));

app.use(csrf());

app.use(flash());


//Tokens
app.use((req, res, next) => {
    res.locals.isAu = req.session.isloggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})


// //AI{
// app.use((req, res, next) => {
//     res.locals.flashMessage = req.session.flashMessage;
//     delete req.session.flashMessage;
//     next();
// });
// //}

app.use((req, res, next) => {
    // throw new Error('Error out');
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id)
    .then(user=>{
        throw new Error('Error');
        if(!user){
            return next();
        }

        req.user = user;
        next();
        
    })
    .catch(err=>{
        // throw new Error(err);
        next(new Error(err)); //the next error is used with async code & thorws error is used with sync
    });
});




//Routes
app.use('/admin',adminRoutes);
app.use(shopRoute);
app.use(authRoutes);
app.use('/500',errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
    res.status(500).render('500'
        , {
            docTitle: 'error 500 '
            ,path: '/500'
            ,islogedIn: req.session.islogedIn
        });
})


mongoose
    .connect(
        MONGODB_URI
    )
    .then(() => {
        app.listen(3000);
        console.log('Connected!');
    })
    .catch(err => {
        console.log(err);
});



