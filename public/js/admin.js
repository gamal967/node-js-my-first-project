const deleteProduct = (btn) =>{
    const prodId=btn.parentNode.querySelector('[name=productId]').value
    const csrfToken=btn.parentNode.querySelector('[name=_csrf]').value

    const productItem=btn.closest('article');
    



    fetch('/admin/product/'+prodId,{
        method: 'DELETE',
        headers: {
            'csrf-token':csrfToken
        }
    })
    .then(result=>{
        if(!result.ok){
            throw new Error('Something went wrong status:'+result.status);
        }
        return result.json()
    })
    .then(data=>{
        console.log(data);
        productItem.remove();
    })
    .catch(err=>console.log(err));
}