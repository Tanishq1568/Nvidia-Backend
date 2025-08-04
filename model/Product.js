const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  image: String,
  category: String,
  status: String,
  price:Number,
  total: Number
});

const Product = mongoose.model("Product", productSchema, "Product");
module.exports = Product;
