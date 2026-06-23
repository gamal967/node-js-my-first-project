const getDb=require('../util/DB').getDb;
const mongodb=require('mongodb');

class Product{

    constructor(title, imageUrl, description, price, id, userId){
        this.title=title;
        this.imageUrl=imageUrl;
        this.description=description;
        this.price=price;
        this._id=  id ? new mongodb.ObjectId(id):null;
        this.userId=userId;
    }
    save(){
        const db=getDb();
        let dbOp;

        
        if(this._id){
            //update
            
            dbOp=db.collection('products').updateOne(
                {_id: this._id},
                {$set: this}
            );
            
        }else{
            //insert
            
            dbOp=db.collection('products').insertOne(this);
        }
        
        return dbOp
            .then(result=>{
                // console.log(result);
                return result;
            })
            .catch(err=>console.log(err));

    }
    static fetchAll(){
        const db=getDb();
        
        return db.collection('products')
            .find()
            .toArray()
            .then(products=>{
                // console.log(products);
                return products;
            })
            .catch(err=>console.log(err));
    }

    static findById(prodId){
        const db=getDb();
        
        return db.collection('products')
            .findOne({_id: new mongodb.ObjectId(prodId)})
            .then(product=>{
                // console.log(product);
                return product;
            })
            .catch(err=>console.log(err));
    }
    
    static deleteById(prodId){
        const db=getDb();
        
        return db.collection('products')
            .deleteOne({_id: new mongodb.ObjectId(prodId)})
            .then(()=>{
                console.log('Deleted Product');
                // return product;
            })
            .catch(err=>console.log(err));
    }
}




module.exports = Product;