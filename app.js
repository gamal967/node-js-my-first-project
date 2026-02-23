
const rootDir =require('./util/path');
const path =require('path');
const express =require('express');
const app = express();
const bodyParser =require('body-parser');   
const adminRoutes =require('./routes/admin'); 
const shopRoute =require('./routes/shop');




app.set('view engine','pug');
app.set('views','views');


app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(rootDir,'public')));

app.use('/admin',adminRoutes);
app.use(shopRoute);

const errorController=require('./controllers/error');
app.use(errorController.get404);

app.listen(3000); 


