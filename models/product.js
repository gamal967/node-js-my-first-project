
const fs = require('fs');
const path = require('path');
const root = require('../util/path');

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
    constructor(title, imageUrl, price, description){
        this.title=title;
        this.imageUrl=imageUrl;
        this.description=description;
        this.price=price;
    }


    save(){
        this.id=Math.random().toString();
    productsFile((products)=>{
        products.push(this);
            fs.writeFile(
                    p,
                    JSON.stringify(products, null, 2),
                    (err)=>{
                        console.log(err);
                    }
            );
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
    static updateById(id, updatedProduct, cb) {
        productsFile((products) => {
            const productIndex = products.findIndex(p => p.id === id);
            if (productIndex !== -1) {
                products[productIndex] = { ...products[productIndex], ...updatedProduct };
                fs.writeFile(p, JSON.stringify(products, null, 2), (err) => {
                    if (err) {
                        console.log(err);
                        cb(false);
                    } else {
                        cb(true);
                    }
                });
            } else {
                cb(false);
            }
        });
    }
};