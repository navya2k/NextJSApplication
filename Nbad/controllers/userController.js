const model = require('../models/user');
const item = require('../models/item');
const trade_model=require('../models/item_trade')
exports.new = (req, res)=>{
    res.render('./user/new');
};

exports.create = (req, res, next)=>{
    //res.send('Created a new story');
    let user = new model(req.body);//create a new story document
    user.save()//insert the document to the database
    .then(user=> res.redirect('/users/login'))
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('/users/new');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('/users/new');
        }
        
        next(err);
    }); 
};

exports.getUserLogin = (req, res, next) => {

    res.render('./user/login');
}

exports.login = (req, res, next)=>{

    let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            console.log('wrong email address');
            req.flash('error', 'wrong email address');  
            res.redirect('/users/login');
            } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/users/profile');
            } else {
                req.flash('error', 'wrong password');      
                res.redirect('/users/login');
            }
            });     
        }     
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next)=>{
    let id = req.session.user;
    Promise.all([model.findById(id),item.find({author:id}),trade_model.find({tradeBy: id}), trade_model.find()]) 
    .then(results=>{
        //console.log('Hi')
        const [user,items,trades]=results;
        //res.render('./user/profile', {user,items})
        item.find({'_id':{$in:user.watchlist}})
        .then(watchlist => {
            res.render('./user/profile', {user, items, watchlist, trades});
        })
        .catch(err => next(err));
    })
    .catch(err=>next(err));
};


exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
   
 };

 exports.selectionpage = (req, res, next) => {
    let id = req.params.id;
    item.find({author: req.session.user})
    .then(items => {
        if(items.length>0){
            res.render('./usertradelist', {items, id});
        }
        else{
            req.flash('error','There are no threads for tarding')
            res.redirect('/trades')
        }
        
    })
    .catch(err => next(err));
};

exports.createtrade = (req, res, next) => {
    let id = req.params.id; //item id that you are interested in
    
    let user_item = req.body.item; //user's item to trade
    Promise.all([
        item.findByIdAndUpdate(id, {status: "Offer Pending", tradereq_id: user_item, tradedwith_id: id, traded: true}, {useFindAndModify: false, runValidators: true}),
        item.findByIdAndUpdate(user_item, {status: "Offer Pending",  tradedwith_id: id, tradereq_id: user_item, initiated: true}, {useFindAndModify: false, runValidators: true})])
    .then(results => {
        let [trade, user_trade] = results;
        let tradee = new trade_model();
        tradee.tradeBy = req.session.user;
        tradee.name = trade.name;
        tradee.category = trade.category;
        tradee.status = trade.status;
        tradee.trade_with = user_item;
        tradee.trade_for = id;
        tradee.save()
        .then(tradee => {
            res.redirect('/users/profile');
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
};

exports.canceltrade = (req, res, next) => {
    let id = req.session.user;
    let items = req.params.id;
    trade_model.findOneAndDelete({trade_for: items}, {useFindAndModify: false})
    .then(offer => {
        item.findByIdAndUpdate(items, {status: 'Available', traded: false, initiated: false}, {useFindAndModify: false, runValidators: true})
        .then(trade => {
            item.findByIdAndUpdate(trade.tradereq_id, {status: 'Available', traded: false, initiated: false}, {useFindAndModify: false, runValidators: true})
            .then(trade => {
                console.log("trade: ", trade);
                res.redirect('/users/profile');
            })
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
};

exports.managetrade = (req, res, next) => {
    let id = req.params.id;
    item.findById(id)
    .then(trade => {
        console.log(trade);
        if(!trade.traded){

            trade_model.find({trade_with: id})
            .then(offer => {

                console.log(id);
                if(offer.length > 0){
                    Promise.all([item.findById(offer[0].trade_for), item.findById(offer[0].trade_with)])
                    .then(results => {
                        let [trade, items] = results;
                        //console.log(trade, item);
                        let initiated = items.initiated;
                        res.render('./managetrade', {trade, items, initiated});
                    })
                    .catch(err => next(err));
                }
                else{
                    let err = new Error('Cannot find a trade request');
                    err.status = 404;
                    next(err);
                }
            })
            .catch(err => next(err));
        }
        else{
            trade_model.find({trade_for: id})
            .then(offer => {
                if(offer.length > 0){
                    Promise.all([item.findById(offer[0].trade_for), item.findById(offer[0].trade_with)])
                    .then(results => {
                        let [trade, items] = results;
                        //console.log(trade, item);
                        let initiated = trade.initiated;
                        res.render('./managetrade', {trade, items, initiated});
                    })
                    .catch(err => next(err));
                }
                else{
                    let err = new Error('Cannot find a trade request');
                    err.status = 404;
                    next(err);
                }
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));

    
};

exports.accepttrade = (req, res, next) => {
    let id = req.session.user;
    let item1 = req.params.id;
    trade_model.find({trade_for: item1, tradeBy: id}, {useFindAndModify: false})
    .then(offer => {
        item.findByIdAndUpdate(item1, {status: 'Traded', intitiated: false, traded: false}, {useFindAndModify: false, runValidators: true})
        .then(trade => {
            item.findByIdAndUpdate(trade.tradereq_id, {status: 'Traded', initiated: false, traded: false}, {useFindAndModify: false, runValidators: true})
            .then(trade => {
                trade_model.findOneAndDelete({trade_for: item1}, {useFindAndModify: false})
                .then(trade1 => {
                    res.redirect('/users/profile');
                })
                .catch(err => next(err));
            })
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
};




