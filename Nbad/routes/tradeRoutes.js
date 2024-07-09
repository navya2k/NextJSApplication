const express= require('express');
const controller=require('../controllers/tradeController')
const {isLoggedIn,isAuthor}=require('../middlewares/auth');
const {validateId,validatetrade,validationresult} = require('../middlewares/validator');
const router=express.Router();

router.get('/',controller.index);

router.post('/trades',isLoggedIn,validatetrade,validationresult,controller.create)
router.get('/trades',controller.allTrades)
//GET /stories/:id: send details of story identified by story
router.get('/trades/:id',validateId,controller.trade)

router.get('/trades/:id/update',isLoggedIn,validateId,isAuthor,controller.edit)

//PUT /stories/:id: update the story identified by story
router.put('/trades/:id', validateId, isLoggedIn, isAuthor, validatetrade,validationresult,controller.update)
//DELETE
router.delete('/trades/:id',validateId,isLoggedIn,isAuthor,controller.delete)
router.post('/trades/:id/watch', validateId, isLoggedIn, controller.addtowatchlist);


router.post('/trades/:id/unwatch', validateId, isLoggedIn, controller.removefromwatchlist);

//router.get('/trades/:id/usertradelist',controller.tradelist)
//router.get("/trades/:id/trade",  controller.trade1);

//router.get("/trades/:id/tradeitem",  controller.tradeitem);
//router.put('/trades/:id/trade',controller.request_trade)
module.exports=router;