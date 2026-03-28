const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getDashboard,
  importProducts
} = require("../controllers/productController");
const upload = require("../middleware/upload");

router.post("/", authMiddleware, createProduct);
router.post("/import", authMiddleware, upload.single("file"), importProducts);
router.get("/", authMiddleware, getProducts);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);
router.get("/dashboard", authMiddleware, getDashboard);

module.exports = router;

module.exports = router;