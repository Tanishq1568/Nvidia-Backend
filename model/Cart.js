const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  price: Number,
  image: String // Optional: if you want to store product image
});

module.exports = mongoose.model("Cart", cartSchema);
