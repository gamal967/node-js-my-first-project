const deleteProduct = (btn) => {
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrfToken = btn.parentNode.querySelector('[name=_csrf]').value;
    const productItem = btn.closest('article');

    btn.disabled = true;

    fetch('/admin/product/' + prodId, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrfToken
        }
    })
    .then(result => {
        if (!result.ok) {
            throw new Error('Something went wrong status:' + result.status);
        }
        return result.json();
    })
    .then(data => {
        console.log(data);
        productItem.remove();
    })
    .catch(err => {
        console.error(err);
        btn.disabled = false;
    });
};

// No inline onclick: Helmet's CSP blocks inline event handlers.
document.querySelectorAll('.js-delete-product').forEach(btn => {
    btn.addEventListener('click', () => deleteProduct(btn));
});
