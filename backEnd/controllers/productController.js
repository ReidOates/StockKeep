const Product = require("../models/Product");
const Category = require("../models/Category");
const xlsx = require("xlsx");
const fs = require("fs");
const { analyzeInventoryContent } = require("../services/aiService");

// Helper to escape special regex characters
const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

exports.importProducts = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "File tidak ditemukan." });
        }

        const filePath = req.file.path;
        console.log("Processing File Path:", filePath);

        if (!fs.existsSync(filePath)) {
            throw new Error("File gagal dikalibrasi di server.");
        }

        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) throw new Error("File Excel tidak memiliki sheet yang valid.");
        
        const sheet = workbook.Sheets[sheetName];
        
        // Ambil data mentah sebagai array of arrays
        const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        console.log("Raw Rows Found:", rawRows.length);

        if (rawRows.length === 0) {
            throw new Error("File Excel kosong.");
        }

        let finalData = [];
        // Cek apakah ada header 'Name' yang valid di 3 baris pertama (biasanya ada header)
        let hasHeader = false;
        for (let i = 0; i < Math.min(3, rawRows.length); i++) {
            if (rawRows[i].some(cell => cell && typeof cell === 'string' && cell.toLowerCase().includes("name"))) {
                hasHeader = true;
                break;
            }
        }

        // Gunakan AI jika dipaksa atau tidak ada header standar
        const useAI = req.body.useAI === "true" || !hasHeader;

        /**
         * Fungsi untuk menormalkan data dari AI.
         * AI terkadang memberikan nama field yang variatif (contoh: 'nama', 'item', 'stok', 'harga').
         */
        const normalizeAIData = (data) => {
            return data.map(item => {
                const normalized = {};
                
                // Mapping Name
                normalized.name = item.name || item.Name || item.nama || item.barang || item.nama_barang || item.item_name || "";
                
                // Mapping Category
                normalized.category = item.category || item.Category || item.kategori || item.groups || "General";
                
                // Mapping Price (Pastikan Number)
                const rawPrice = item.price || item.Price || item.harga || item.unit_price || 0;
                normalized.price = typeof rawPrice === 'string' ? parseFloat(rawPrice.replace(/[^0-9.]/g, '')) : Number(rawPrice);
                
                // Mapping Stock (Pastikan Number)
                const rawStock = item.stock || item.Stock || item.stok || item.jumlah || item.quantity || 1;
                normalized.stock = typeof rawStock === 'string' ? parseInt(rawStock.replace(/[^0-9]/g, ''), 10) : Number(rawStock);

                return normalized;
            });
        };

        if (useAI) {
            console.log("Starting AI Smart Scan Mode...");
            const rawText = rawRows
                .filter(row => row && row.some(cell => cell !== null && cell !== ""))
                .map(row => row.join(" | "))
                .join("\n");
            
            if (!rawText.trim()) throw new Error("Tidak ada konten yang terbaca dalam file.");
            
            console.log("AI Input Length:", rawText.length);
            const aiRawData = await analyzeInventoryContent(rawText);
            finalData = normalizeAIData(aiRawData);
            console.log("AI Extracted & Normalized:", finalData.length, "items");
        } else {
            console.log("Standard Import Mode...");
            const jsonRows = xlsx.utils.sheet_to_json(sheet);
            finalData = jsonRows.map(row => ({
                name: row.Name || row.name,
                category: row.Category || row.category,
                price: row.Price || row.price,
                stock: row.Stock || row.stock
            }));
        }

        let createdCount = 0;
        let updatedCount = 0;

        for (const item of finalData) {
            const { name, category: catName, price, stock } = item;

            if (!name || name.toString().trim() === "") continue;

            const safeName = name.toString().trim();
            const safeCategoryName = (catName || "General").toString().trim();

            // Find or create category (Safe regex search)
            let category = await Category.findOne({ 
                name: { $regex: new RegExp(`^${escapeRegExp(safeCategoryName)}$`, "i") } 
            });
            
            if (!category) {
                category = await Category.create({ name: safeCategoryName, createdBy: req.user.id });
            }

            // Upsert product (Safe regex search)
            const existingProduct = await Product.findOne({ 
                name: { $regex: new RegExp(`^${escapeRegExp(safeName)}$`, "i") } 
            });
            
            if (existingProduct) {
                existingProduct.price = isNaN(price) ? existingProduct.price : Number(price);
                existingProduct.stock = isNaN(stock) ? existingProduct.stock : Number(stock);
                existingProduct.category = category._id;
                await existingProduct.save();
                updatedCount++;
            } else {
                await Product.create({
                    name: safeName,
                    price: isNaN(price) ? 0 : Number(price),
                    stock: isNaN(stock) ? 0 : Number(stock),
                    category: category._id,
                    createdBy: req.user.id
                });
                createdCount++;
            }
        }

        // Cleanup temp file
        try { fs.unlinkSync(filePath); } catch (e) { console.error("Unlink error:", e); }

        return res.status(200).json({
            success: true,
            message: useAI ? "AI Smart Import Berhasil!" : "Import Berhasil!",
            summary: {
                total: finalData.length,
                created: createdCount,
                updated: updatedCount
            }
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch (e) {}
        }
        console.error("IMPORT ERROR:", error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || "Gagal memproses file." 
        });
    }
};

exports.createProduct = async (req, res, next) => {
    try {
        const { name, price, stock, category } = req.body;
        if (!name || !price || !category) {
            return res.status(400).json({ message: "Semua field wajib diisi." });
        }
        const product = await Product.create({ name, price, stock, category, createdBy: req.user.id });
        res.status(201).json(product);
    } catch (error) { next(error); }
};

exports.getProducts = async (req, res, next) => {
    try {
        const { search, category } = req.query;
        let filter = {};
        if (search) filter.name = { $regex: search, $options: "i" };
        if (category) filter.category = category;
        const products = await Product.find(filter).populate("category", "name").populate("createdBy", "name email");
        res.json(products);
    } catch (error) { next(error); }
};

exports.updateProduct = async (req, res, next) => {
    try {
        const { name, price, stock, category } = req.body;
        const updated = await Product.findByIdAndUpdate(req.params.id, { name, price, stock, category }, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ message: "Produk tidak ditemukan." });
        res.json(updated);
    } catch (error) { next(error); }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Produk dihapus." });
    } catch (error) { next(error); }
};

exports.getDashboard = async (req, res, next) => {
    try {
        const products = await Product.find().populate("category", "name");
        const categories = await Category.find();
        const totalProducts = products.length;
        const totalCategories = categories.length;
        let totalStock = 0, totalValue = 0, lowStockCount = 0;
        const LOW_STOCK_THRESHOLD = 5;
        products.forEach(p => {
            totalStock += (p.stock || 0);
            totalValue += (p.price || 0) * (p.stock || 0);
            if ((p.stock || 0) < LOW_STOCK_THRESHOLD) lowStockCount++;
        });
        const catMap = {};
        products.forEach(p => { if (p.category && p.category.name) catMap[p.category.name] = (catMap[p.category.name] || 0) + 1; });
        const categoryDistribution = Object.keys(catMap).map(name => ({ name, value: catMap[name] }));
        const topStockProducts = [...products].sort((a, b) => (b.stock || 0) - (a.stock || 0)).slice(0, 5).map(p => ({ name: p.name, stock: p.stock }));
        const recentProducts = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        res.json({ totalProducts, totalCategories, totalStock, totalValue, lowStockCount, categoryDistribution, topStockProducts, recentProducts });
    } catch (error) { next(error); }
};