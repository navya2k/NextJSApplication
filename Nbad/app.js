const express=require('express');
const morgan=require('morgan');
const session = require('express-session');
const methodOverride=require('method-override');
const mongoose=require('mongoose');
const ItemRoutes=require('./routes/mainRoutes');
const ItemRoutes1=require('./routes/tradeRoutes');
const MongoStore=require('connect-mongo');
const User=require('./models/user');
const userRoutes = require('./routes/userRoutes');
const flash=require('connect-flash');

const app=express();


//configure app
let port=3000;
let host='localhost';
app.set('view engine','ejs');
mongoose.connect('mongodb://localhost:27017/demos',{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=>{
    app.listen(port,host,()=>{
        console.log('server is running on  port',port);
    })
    
})
.catch(err=>console.log(err.message))

app.use(express.static('public'));
app.use(express.urlencoded({extened:true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));


app.use(session({
    secret:'helloheythere1**',
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:60*60*1000},
    store:new MongoStore({mongoUrl:'mongodb://localhost:27017/demos'})
}));
app.use(flash());
app.use((req,res,next)=>{
    // if(!req.session.counter)
    //     req.session.counter=1;
    // else
    //     req.session.counter++;
    //console.log(req.session);
    res.locals.user=req.session.user||null;
    res.locals.successMessages=req.flash('success');
    res.locals.errorMessages=req.flash('error');
    next();
});

app.get('/',(req,res)=>{
    res.render('index');

});
app.use('/',ItemRoutes);
app.use('/',ItemRoutes1);
app.use('/users', userRoutes);



app.use((req,res,next)=>{
    let err=new Error('The server cannot locate '+req.url);
    err.status=404;
    next(err);
});

app.use((err,req,res,next)=>{
    console.log(err.stack)
   if(!err.status){
       err.status=500;
       err.message=("Internal Server Error")
   }
   res.status(err.status);
   res.render('error',{error:err})
});
