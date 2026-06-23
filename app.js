
const rootDir =require('./util/path');
const path =require('path');
const express =require('express');
const app = express();
const bodyParser =require('body-parser');   
const errorController=require('./controllers/error');
const adminRoutes =require('./routes/admin'); 
const shopRoute =require('./routes/shop');  
const mongoConnect =require('./util/DB').mongoConnect;
const User =require('./models/user');





app.set('view engine','pug');
app.set('views','views');



app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(rootDir,'public')));

app.use((req,res,next)=>{
    User.findById('6a1c347d6bcf83794bb68bc6')
    .then(user=>{
        req.user = new User(user._id, user.userName, user.email, user.cart);
        next();
    })
    .catch(err=>console.log(err));
    
});

app.use('/admin',adminRoutes);
app.use(shopRoute);

app.use(errorController.get404);


mongoConnect(()=>{
    app.listen(3000);
});




