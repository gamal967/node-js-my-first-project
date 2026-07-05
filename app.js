
const rootDir =require('./util/path');
const path =require('path');
const express =require('express');
const app = express();
const bodyParser =require('body-parser');   
const errorController=require('./controllers/error');
const adminRoutes =require('./routes/admin'); 
const shopRoute =require('./routes/shop');  
const User =require('./models/user');
const mongoose= require('mongoose');






app.set('view engine','pug');
app.set('views','views');



app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(rootDir,'public')));

app.use((req,res,next)=>{
    User.findById('6a42938159890bb50d44b632')
    .then(user=>{
        req.user = user;
        next();
    })
    .catch(err=>console.log(err));
    
});

app.use('/admin',adminRoutes);
app.use(shopRoute);

app.use(errorController.get404);


mongoose
    .connect(
        'mongodb://gamalelctron2332_db_user:gggmmmlll333@ac-0pastqb-shard-00-00.akdhoiv.mongodb.net:27017,ac-0pastqb-shard-00-01.akdhoiv.mongodb.net:27017,ac-0pastqb-shard-00-02.akdhoiv.mongodb.net:27017/shop?ssl=true&replicaSet=atlas-ogso4t-shard-0&authSource=admin&appName=Cluster0'
    )
    .then(() => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'Gamal',
                    email: 'GeMe@example.com',
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
            
        })
        app.listen(3000);
        console.log('Connected!');
    })
    .catch(err => {
        console.log(err);
});



