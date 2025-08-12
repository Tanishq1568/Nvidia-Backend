const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://nvidia-fend.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Handle all OPTIONS requests safely
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(200);
  }
  next();
});



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect("mongodb+srv://tanishqgarg57:SGSeic2Kj3Ot8MI2@tanishq.e51sp0t.mongodb.net/Nvidia", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB connected.");
})
.catch((err) => {
  console.error("MongoDB connection error:", err);
});

// Import User Schema
const user = require("./model/User");

// Signup Route (unchanged as per your request)


app.post("/signup", async (req, res) => {
  let a = req.body;
  console.log(req.body);

  let userdata = await user.create({
  firstname: a.firstname,
  lastname: a.lastname,
  email: a.email,
  password: a.password,
});
  
  let result = await userdata.save();

  if (result) {
    res.json({
      status: true,
      msg: "signup success"
    });
  } else {
    res.json({
      status: false,
      msg: "signup failed"
    });
  }
});


app.get("/signup", async (req, res) => {
  try {
    const users = await user.find();
    res.json(users); // return plain array
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});



app.delete("/signup/:id", async (req, res) => {
  try {
    await user.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
})

// Get All Users
app.get("/allusers", async (req, res) => { 
  try {
    let allusers = await user.find({});
    res.json({
      status: true,
      ouruser: allusers
    });
  } catch (err) {
    res.json({
      status: false,
      msg: "Error fetching users"
    });
  }
});

// Login Route
app.post("/loginuser", async (req, res) => {
  try {
    const { email, password } = req.body;

    
    if (!email || !password) {
      return res.json({
        status: false,
        msg: "Please fill all the fields"
      });
    }

    
    const userdata = await user.findOne({ email });

    if (!userdata) {
      return res.json({
        status: false,
        msg: "User not found"
      });
    }

    // Check password
    if (userdata.password === password) {
      res.json({
        status: true,
        msg: "Login success",
        user: userdata
      });
    } else {
      res.json({
        status: false,
        msg: "Invalid password"
      });
    }
  } catch (error) {
    console.log("Login error:", error);
    res.json({
      status: false,
      msg: "Server error"
    });
  }
});

app.post("/forgotpassword", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userExist = await user.findOne({ email });
    if (!userExist) {
      return res.json({ success: false, message: "Email not found!" });
    }

    userExist.password = password;
    await userExist.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const Product = require("./model/Product");

app.post("/AddCategories", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json({ success: true, message: "Product added successfully" });
  } catch (err) {
    console.error("Add Product Error:", err);
    res.status(500).json({ success: false, message: "Failed to add product" });
  }
});


app.get("/AddCategories", async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, products });
  } catch (err) {
    console.error("❌ Get Products Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
});

app.delete("/deleteCategor/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ _id: req.params.id });

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category deleted successfully", deletedProduct });
  } catch (err) {
    console.error("Delete Category Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete category" });
  }
});


// CART -----------------------------------


const Cart = require("./model/Cart");


app.post("/cart", async (req, res) => {
  try {
    const { name, quantity, price, image } = req.body;
    const existing = await Cart.findOne({ name });

    if (existing) {
      return res.status(400).json({ success: false, message: "Item already in cart" });
    }

    const result = await Cart.create({ name, quantity, price, image });
    res.status(201).json({ success: true, message: "Item added to cart", result });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.get("/cart", async (req, res) => {
  try {
    const items = await Cart.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching cart items" });
  }
});


app.delete("/cart/:id", async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete item" });
  }
});


//review-------------------------------------------------------------------------------------------------------


const Review = require('./model/Review');
// POST Review
app.post("/reviews", async (req, res) => {
  try {
    const newReview = new Review(req.body);
    const saved = await newReview.save();
    res.json(saved);
  } catch (err) {
    console.error("Error saving review:", err); // DEBUG LINE
    res.status(500).json({ error: "Failed to save review" });
  }
});

// GET Reviews
app.get("/reviews", async (req, res) => {
  try {
    const { productId } = req.query;
    const filter = productId ? { productId } : {};
    const reviews = await Review.find(filter).sort({ date: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});


// DELETE Review by ID
app.delete("/reviews/:id", async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Review not found" });
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});


app.get("/",(req,res)=>{
  res.json({status:true})
})



module.exports = app;

