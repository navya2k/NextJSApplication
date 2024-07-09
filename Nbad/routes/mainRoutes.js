const express= require('express');
const controller=require('../controllers/mainController')
const router=express.Router();
const {isLoggedIn,isAuthor}=require('../middlewares/auth');
const {validateId} = require('../middlewares/validator');

router.get('/about',controller.about)
router.get('/contact',controller.contact)

//GET /stories/new:send html form for creating new story
router.get('/newTrade',isLoggedIn,controller.newTrade);
module.exports=router;