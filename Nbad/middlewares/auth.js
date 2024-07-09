const Item=require('../models/item')
//check if user is a guest
exports.isGuest=(req,res,next)=>{
    if(!req.session.user)
        return next();
    //res.render('./user/new');
    else{
        req.flash('error','You are logged in already');
        return res.redirect('/users/profile');
    }
}
exports.isLoggedIn =(req,res,next)=>{
    if(req.session.user){
        return next();
    }else{
        req.flash('error','You need to login first');
        return res.redirect('/users/login');
    }
    
}
exports.isAuthor =(req,res,next)=>{
    let id=req.params.id;
    Item.findById(id)
    .then(item=>{
        if(item){
            //console.log(story.author)
            //console.log(req.session.user)
        if(item.author == req.session.user)
            return next();
        else{
            //console.log("Hola")
            let err=new Error('Unauthorized to access the resource');
            err.status=401;
            return next(err);
        }
    } else {
        let err = new Error('Cannot find a trade with id ' + req.params.id);
        err.status = 404;
        return next(err);
    }
    
    })
    .catch(err=>next(err))
};