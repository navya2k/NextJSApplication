const mongoose=require('mongoose');
const Schema=mongoose.Schema
const itemSchema= new Schema({
    name:{type:String,required:[true,'title is required']},
    category:{type:String,required:[true,'category is required']},
    details:{type:String,required:[true,'Details is required'],minLength:[10,'the content should have atleast 10 characters']},
    status:{type:String,required:[true,'status is required']},
    Image:{type:String,required:[true,'Image is required']},
    tradereq_id:{type:Schema.Types.ObjectId,ref:'Item'},
    tradedwith_id:{type:Schema.Types.ObjectId,ref:'User' },
    initiated: {type: Boolean},
    //wishlist:{},
    traded:{type:Boolean},
    //tradeName:{ type: String },

    
    //author:{type:String,required:[true,'author is required']}
    author: {type:Schema.Types.ObjectId,ref:'User' }

},
{timestamps:true}
);
module.exports=mongoose.model('Item',itemSchema);

