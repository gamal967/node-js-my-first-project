
const rootDir =require('./util/path');
const path =require('path');
const express =require('express');
const app = express();
const bodyParser =require('body-parser');   
const adminRoutes =require('./routes/admin'); 
const shopRoute =require('./routes/shop');
const sequelize =require('./util/DB');
const Product =require('./models/product');
const User =require('./models/user');
const CartItem =require('./models/cart-item');
const Cart =require('./models/cart');
const Order =require('./models/order');
const OrderItem=require('./models/order-item');





app.set('view engine','pug');
app.set('views','views');



app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(rootDir,'public')));

app.use((req,res,next)=>{
    User.findByPk(1)
    .then(user=>{
        console.log(user);
        req.user = user;
        next();
    })
    .catch(err=>console.log(err));
});

app.use('/admin',adminRoutes);
app.use(shopRoute);

const errorController=require('./controllers/error');
app.use(errorController.get404);


User.hasMany(Product);
Product.belongsTo(User,{constraints:true,onDelete:'CASCADE'});

User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product,{through:CartItem});
Product.belongsToMany(Cart,{through:CartItem});

Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product,{through:OrderItem});


sequelize
    // .sync({force:true})
    .sync()
    .then(result=>{
        return User.findByPk(1);
        // console.log(result);
        

    }).then(user=>{
        if(!user){
            return User.create({name:'Max',email:'XoH4P@example.com'});
        }
        return user;
    }).then(user=>{
        return user.getCart()
                .then(cart=>{
                if(!cart){
                return user.createCart();
                }
    return cart;
})
        // console.log(user);
    }).then(cart=>{
        app.listen(3000);
        
    })
    .catch(err=>console.log(err));




