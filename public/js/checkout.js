(function () {
    const orderBtn = document.getElementById('order-btn');
    if (!orderBtn) return;

    const stripe = Stripe(orderBtn.dataset.publishableKey);

    orderBtn.addEventListener('click', function () {
        orderBtn.disabled = true;
        stripe.redirectToCheckout({
            sessionId: orderBtn.dataset.sessionId
        }).then(function (result) {
            if (result.error) {
                orderBtn.disabled = false;
                alert(result.error.message);
            }
        });
    });
})();
