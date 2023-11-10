const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OrderItemSchema = new Schema({
  id: Schema.Types.ObjectId,
  quanity: Number,
});

module.exports = mongoose.model("OrderItem", OrderItemSchema);
