const model=require('../models/item');
const trade_model=require('../models/item_trade')
const user = require('../models/user');
//const mongoose=require('mongoose')
exports.index=(req,res)=>{
    model.find()
    .then(items=>res.render('./index',{items}))
    .catch(err=>next(err));
    
};
exports.create=(req,res,next)=>{
    
    let item=new model(req.body);
    console.log(item);
    item.author=req.session.user;
    item.traded=false;
    item.initiated=false;
    item.save()
    .then(item=>{
      req.flash('success', 'A Trade has been created successfully');
        
        res.redirect('/trades');
    })
    .catch(err=>{
        if(err.name=== 'ValidationError'){
            err.status=400;
            return res.redirect('/back');
        }
        next(err);
    });
};
    

exports.allTrades=(req,res,next)=>{
    
    model.find()
    .then(items=>{
       model.distinct("category")
       .then(categories=>{
        res.render('./trades',{items,categories});
       
    }) 
    .catch(err=>next(err));
       // let categories=model.distinct("category");

    
       
        
    })
    .catch(err=>next(err));
    
    
    
};

exports.trade=(req,res,next)=>{
    let id=req.params.id;
    model.findById(id).populate('author','firstName lastName')
    .then(item=>{
        
        if(item){
          user.findById(req.session.user)
            .then(user => {
                let watchlisted = false;
                if(user){
                    console.log(req.session.user+ " " +user);
                    if(user.watchlist.length > 0){
                        if(user.watchlist.indexOf(item._id) !== -1)
                            watchlisted = true;
                    }
                }

           // console.log(item)
            res.render('./trade',{item,watchlisted});})}
            else{
                let err=new Error('Cannot find a item with id :'+id);
                err.status=404;
                next(err);}
            //res.status(404).send('Cannot find story with id '+id)}
           // res.send('send story with id :'+req.params.id)
       

    })
    .catch(err=>next(err));
};
    
exports.edit=(req,res,next)=>{
    // res.send('send the edit form')
    let id=req.params.id;
    // if(!id.match(/^[0-9a-fA-F]{24}$/)){
    //     let err=new Error('Invalid item id');
    //     err.status=400;
    //     return next(err);
    // }
    model.findById(id)
    .then(item=>{
        if(item){
            res.render('./update',{item});}
          //res.redirect('./update')}
            else{
                let err=new Error('Cannot find a item with id :'+id);
                err.status=404;
                next(err);}

    })
    .catch(err=>next(err));
    
              //res.status(404).send('Cannot find story with id '+id)}
 };
 exports.update=(req,res,next)=>{
    //res.send('update story with id'+req.params.id)
    let item=req.body;
    let id=req.params.id;
    
    // if(!id.match(/^[0-9a-fA-F]{24}$/)){
    //     let err=new Error('Invalid item id');
    //     err.status=400;
    //     return next(err);
    // }
    model.findByIdAndUpdate(id,item,{useFindAndModify:false,runValidators:true})
    .then(item=>{
        if(item){
            res.redirect('/trades/'+id);

        }
        else{
            let err = new Error('Cannot find a item with id ' + id);
        err.status = 404;
        next(err);

        }
    })
    .catch(err=>{
        if(err.name === 'ValidationError')
            err.status=400;
        next(err);
        return res.redirect('/back');
    });
};

// exports.tradelist=(req,res,next)=>{
//     let tradeforId=req.params.id;
//     model.find({author:req.session.user})
//     .then(items=>{
//         //console.log(tradeforId)
//         res.render('./usertradelist',{items,tradeforId});
       
//     }) 
//     .catch(err=>next(err));
   

// };
// exports.request_trade=(req,res,next)=>{
//     console.log('Hi')
//     //let id1=
//     let tradeforId=req.body.tradeforId;
//     let tradedwithId=req.params.tradedwithId;
//     model.updateOne({_id:tradedwithId},
//         {$set:{tradeforId:tradeforId,status:"offer Pending"}},
//         {useFindAndModify:false,runValidators:true})
//     .then(item=>{
//         if(item){
//             model.updateOne({_id:tradeforId},
//                 {$set:{tradeforId:tradedwithId,status:"offer Pending"}},
//                 {useFindAndModify:false,runValidators:true})
//                 .then(items=>{
//                     if(items){
//                         return res.redirect('/users/profile');
//                     }
//                     else{
//                         let err=new Error("Unable to start trade request");
//                         err.status=404;
//                         next(err);
//                     }
//                 })
//                 .catch(err=>next(err));}
//                 else{
//                     let err=new Error("Unable to start trade request");
//                         err.status=404;
//                         next(err);

//                 }

//         })
    
//     console.log(id2);
// }




//DELETE
exports.delete=(req,res,next)=>{
let id=req.params.id;
model.findByIdAndDelete(id,{useFindAndModify:false})
.then(item=>{
    if(item && (item.status == "Available")){

        res.redirect('/trades');
    }
    else if(item && (item.status != "Traded")){
      if(item.tradedwith_id == id){
          trade_model.find({trade_for: id})
          .then(offer => {
              console.log(offer)
              model.findByIdAndUpdate(offer[0].trade_with, {status:'Available', traded: false, initiated: false}, {useFindAndModify: false, runValidators: true})
              .then(tr => {
                console.log(tr)
                  trade_model.findOneAndDelete({trade_for: id}, {useFindAndModify: false})
                  .then(tr => {
                      res.redirect('/trades');
                  })
                  .catch(err => next(err));
              })
              .catch(err => next(err));
          })
          .catch(err => next(err));
      }
      else if(item.tradereq_id == id){
          
          trade_model.find({trade_with: id})
          .then(trade1 => {
            console.log(trade1)
              model.findByIdAndUpdate(trade1[0].trade_for, {status: 'Available', traded: false, initiated: false}, {useFindAndModify: false, runValidators: true})
              .then(item1 => {
                  trade_model.findOneAndDelete({trade_with: id}, {useFindAndModify: false})
                  .then(tr => {
                      res.redirect('/trades');
                  })
                  .catch(err => next(err));
              })
              .catch(err => next(err));
          })
          .catch(err => next(err));
      }
  } else if(item && (item.status == "Traded")){
    if(item.tradereq_id == id){
        model.findByIdAndUpdate(item.tradedwith_id, {status: 'Available', traded: false, initiated: false}, {useFindAndModify: false, runValidators: true})
        .then(_trade => {
            res.redirect('/trades');
        })
        .catch(err => next(err));
    }
    else if(item.tradedwith_id == id){
        model.findByIdAndUpdate(item.tradereq_id, {status: 'Available', traded: false, initiated: false}, {useFindAndModify: false, runValidators: true})
        .then(_trade => {
            res.redirect('/trades');
        })
        .catch(err => next(err));
    }
}
else{
    res.redirect('/trades');
}
})
.catch(err => next(err));
};

exports.addtowatchlist = (req, res, next) => {
  let id = req.params.id;
  let user2 = req.session.user;
  user.findByIdAndUpdate(user2, {$push: {watchlist: id}}, {useFindAndModify: false, runValidators: true})
  .then(user2 => {
      if(user2)
          res.redirect('/users/profile');
      else
          res.redirect('/users/login');
  })
  .catch(err => next(err));
};

exports.removefromwatchlist = (req, res, next) => {
  let id = req.params.id;
  let user1 = req.session.user;
  user.findByIdAndUpdate(user1, {$pull: {watchlist: id}}, {useFindAndModify: false, runValidators: true})
  .then(user2 => {
      if(user2)
          res.redirect('back');
  })
  .catch(err => next(err));
};


