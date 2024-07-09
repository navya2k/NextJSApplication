const express = require('express');
const controller = require('../controllers/userController');
const {isGuest,isLoggedIn}=require('../middlewares/auth');
const {loginLimiter}=require('../middlewares/rateLimiters')
const {validateId,validateLogin,validateSignup,validationresult} = require('../middlewares/validator');
const router = express.Router();

//GET /users/new: send html form for creating a new user account

router.get('/new', isGuest,controller.new);

//POST /users: create a new user account

router.post('/',isGuest,validateSignup,validationresult, controller.create);

//GET /users/login: send html for logging in
router.get('/login',isGuest, controller.getUserLogin);

//POST /users/login: authenticate user's login
router.post('/login',loginLimiter,isGuest,validateLogin,validationresult,controller.login);

//GET /users/profile: send user's profile page
router.get('/profile', isLoggedIn,controller.profile);

//POST /users/logout: logout a user
router.get('/logout', isLoggedIn,controller.logout);

router.post('/canceltrade/:id', isLoggedIn, controller.canceltrade);


router.post('/managetrade/:id', isLoggedIn, controller.managetrade);


router.post('/accepttrade/:id', isLoggedIn, controller.accepttrade);
router.get('/trade/:id',  controller.selectionpage);


router.post('/trade/offer/:id',validateId,controller.createtrade);


module.exports = router;


