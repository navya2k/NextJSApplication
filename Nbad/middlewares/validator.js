const {body}=require('express-validator');
const {validationResult}=require('express-validator');
exports.validateId = (req, res, next) => {
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid trade id');
        err.status = 400;
        return next(err);
    } else {
        return next();
    }
}
exports.validateSignup = [body('firstName', 'First Name cannot be empty').notEmpty().trim().escape(),
body('lastName', 'Last Name cannot be empty').notEmpty().trim().escape(),
body('email', 'Email must be a valid mail address').isEmail().trim().escape().normalizeEmail(), 
body('password', 'password must be atleast 8 char and atmost 64').isLength({min:8, max:64})];

exports.validateLogin = [body('email', 'Email must be a valid mail address').isEmail().trim().escape().normalizeEmail(), 
body('password', 'password must be atleast 8 char and atmost 64').isLength({min:8, max:64})];

exports.validationresult= (req,res,next)=>{
    let errors = validationResult(req);
    if(!errors.isEmpty()){
        errors.array().forEach(error=>{
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    }
    else{
        return next();
    }  
}


exports.validatetrade=[body('name','name cannot be empty').notEmpty().trim().escape(),
body('category','category is required').notEmpty().trim().escape(),
body('details','Details must be atleast 1o characters long ').isLength({min:10}),
body('status','status is required').notEmpty().trim().escape(),
body('Image','Image is required').notEmpty()];

exports.validate_editTrade = [body('name', 'name cannot be empty').notEmpty().trim().escape(),
body('category', 'Category cannot be empty').notEmpty().trim().escape(),
body('details', 'Details must be atleast 1o characters long ').isLength({min:10}),
body('status', 'Status cannot be empty').notEmpty().trim().escape(),
body('Image', 'Image is required').notEmpty()];
    