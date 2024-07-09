const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tradeSchema = new Schema({
  name: { type: String, required: [true, "ItemName is required"] },
  category: { type: String, required: [true, "Item Category is required"] },
  tradeBy: { type: Schema.Types.ObjectId, ref: "User" },
  status: { type: String },
  trade_with:{type: Schema.Types.ObjectId, ref: 'Item'},
  trade_for:{type: Schema.Types.ObjectId, ref: 'Item'}
});

module.exports=mongoose.model('trade',tradeSchema);