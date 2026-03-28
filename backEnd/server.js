require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authMiddleware = require("./middleware/authMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();


// ======================
// GLOBAL MIDDLEWARE
// ======================

app.use(cors());
app.use(express.json());


// ======================
// API ROUTES
// ======================

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "StockKeep API Running and healthy",
    mongodb:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user,
  });
});


// ======================
// FRONTEND STATIC FILES
// ======================

const frontendPath = path.join(__dirname, "../frontEnd/dist");

app.use(express.static(frontendPath));

/*
Fallback handler TANPA wildcard string
Ini aman untuk Express versi terbaru
*/
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api")) {
    return next();
  }

  res.sendFile(path.join(frontendPath, "index.html"));
});


// ======================
// ERROR HANDLER (LAST)
// ======================

app.use(errorMiddleware);

// ======================
// DATABASE + SERVER START
// ======================

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.log("DB Error:", err));

