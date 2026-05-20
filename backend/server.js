const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");
const postLogger = require("./middleware/postLogger");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mern_books";
const SESSION_SECRET = process.env.SESSION_SECRET || "super_secret_key_change_in_production";

//  Connect to MongoDB 
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

//  Middleware 
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true, // allow cookies
  })
);
app.use(express.json());

// Session setup — stored in MongoDB so it survives server restarts
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: {
      httpOnly: true,
      secure: true, // set to true in production with HTTPS
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
);

// Custom middleware: log every successful POST (attached before routes)
app.use(postLogger);

//  Routes 
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

// Health check
app.get("/", (req, res) => res.json({ message: "MERN Books API running" }));

//  Start 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
