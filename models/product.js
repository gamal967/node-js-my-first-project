
const fs = require('fs');
const path = require('path');
const root = require('../util/path');
const Cart=require('./cart');

const p =path.join(root,
    'data',
    'products.json'
);

const productsFile=(cb)=>{
    fs.readFile(p,(err,fileContent)=>{
        if(err){
            cb([]); 
        }else{
            cb(JSON.parse(fileContent));
        }
    });

}


module.exports= class Product {
    constructor(id,title, imageUrl, price, description){
        this.id=id;
        this.title=title;
        this.imageUrl=imageUrl;
        this.description=description;
        this.price=price;
    }


    save(){
        productsFile((products)=>{
            if(this.id){
                const existingProductIndex=products.findIndex(p=>p.id===this.id);
                const updatedProducts=[...products];
                updatedProducts[existingProductIndex]=this;
                fs.writeFile(
                    p,
                    JSON.stringify(updatedProducts, null, 2),
                    (err)=>{
                        console.log(err);
                    }
            );
            }else{
                this.id=Math.random().toString();
                products.push(this);
                    fs.writeFile(
                            p,
                            JSON.stringify(products, null, 2),
                            (err)=>{
                                console.log(err);
                            }
            );}
    });
    }

// Delete product
    static deleteById(id){
        productsFile((products)=>{
            const product=products.find(p=>p.id===id);
            if(product){
                const updatedProducts=products.filter(p=>p.id !==id);
                fs.writeFile(
                    p,
                    JSON.stringify(updatedProducts, null, 2),
                    (err)=>{
                        if(!err){
                            Cart.deleteById(id, product.price);
                        }
                    }
                );
            }
        });
    }

    static fetchAll(cb){
        productsFile(cb);
    };


    static findById(id,cb){
        productsFile((products)=>{
            const product=products.find(p=>p.id===id);
            cb(product);
        });
    }
};