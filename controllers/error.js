exports.get404=(req,res,next)=>{
    res.status(404).render('404', {docTitle: 'error 404 ',islogedIn: req.session.islogedIn});
}
exports.get500=(req,res,next)=>{
    res.status(500).render('500', {docTitle: 'error 500 ',islogedIn: req.session.islogedIn});
}