import { useEffect, useState } from "react";
import api from "../api/axios";
import SummaryCard from "../components/SummaryCard";
import { StockLevelsBarChart, CategoryDistributionPieChart } from "../components/DashboardCharts";
import RecentProductsTable from "../components/RecentProductsTable";
import { Package, Tag, Layers, CreditCard, AlertTriangle, Briefcase, Zap, PlusCircle, PackagePlus, FileDown, X, UploadCloud, BrainCircuit, Check, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CardSkeleton, TableSkeleton } from "../components/Skeleton";
import { toast } from "react-hot-toast";

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalCategories: 0,
        totalStock: 0,
        totalValue: 0,
        lowStockCount: 0,
        categoryDistribution: [],
        topStockProducts: [],
        recentProducts: []
    });
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    
    // States
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [useAI, setUseAI] = useState(true);
    
    const [productFormData, setProductFormData] = useState({ name: "", price: "", stock: "", category: "" });
    const [categoryFormData, setCategoryFormData] = useState({ name: "" });
    const [importFile, setImportFile] = useState(null);
    const [importing, setImporting] = useState(false);

    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try {
            const res = await api.get("/products/dashboard");
            setStats(prev => ({ ...prev, ...res.data }));
            const catRes = await api.get("/categories");
            setCategories(catRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching dashboard data", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleQuickAddProduct = async (e) => {
        e.preventDefault();
        try {
            await api.post("/products", productFormData);
            toast.success("Product added successfully!");
            setShowProductModal(false);
            setProductFormData({ name: "", price: "", stock: "", category: "" });
            fetchDashboardData(); 
        } catch (err) {
            toast.error(err.response?.data?.message || "Error adding product");
        }
    };

    const handleQuickAddCategory = async (e) => {
        e.preventDefault();
        try {
            await api.post("/categories", categoryFormData);
            toast.success("Category added successfully!");
            setShowCategoryModal(false);
            setCategoryFormData({ name: "" });
            fetchDashboardData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error adding category");
        }
    };

    const handleImportExcel = async (e) => {
        e.preventDefault();
        if (!importFile) return toast.error("Pilih file terlebih dahulu.");

        const formData = new FormData();
        formData.append("file", importFile);
        formData.append("useAI", useAI);

        try {
            setImporting(true);
            const res = await api.post("/products/import", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success(`${res.data.message || 'Import Berhasil'}: ${res.data.summary.created} baru, ${res.data.summary.updated} diperbarui!`);
            setShowImportModal(false);
            setImportFile(null);
            fetchDashboardData();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Gagal mengimpor file.";
            toast.error(errorMsg);
            console.error("Import Error Detail:", err);
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,Name,Category,Price,Stock\nProduct A,Electronics,100,50\nProduct B,Furniture,250,15";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "stockkeep_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Template berhasil diunduh.");
    };

    const handleExportData = async () => {
        try {
            const res = await api.get("/products");
            const data = res.data;
            const headers = ["Name", "Category", "Price", "Stock"];
            const rows = data.map(p => [p.name, p.category?.name || "N/A", p.price, p.stock]);
            let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `inventory_report_${new Date().toLocaleDateString()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Laporan berhasil diunduh.");
            setShowQuickActions(false);
        } catch (err) {
            toast.error("Gagal mengunduh laporan.");
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div style={{ padding: "2rem", maxWidth: "1600px", margin: "0 auto" }}>
                <div style={{ marginBottom: "2.5rem" }}>
                    <div style={{ height: "2.5rem", width: "300px", backgroundColor: "var(--skeleton-bg)", borderRadius: "8px", marginBottom: "0.5rem" }} />
                    <div style={{ height: "1.2rem", width: "500px", backgroundColor: "var(--skeleton-bg)", borderRadius: "4px", opacity: 0.5 }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
                    <CardSkeleton /> <CardSkeleton /> <CardSkeleton /> <CardSkeleton />
                </div>
                <TableSkeleton rows={8} />
            </div>
        );
    }

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={{ backgroundColor: "var(--bg-color)", minHeight: "100vh", padding: "2rem" }}
        >
            <div style={{ maxWidth: "1600px", margin: "0 auto" }}>
                <div style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                        <h1 style={{ fontSize: "2.25rem", fontWeight: "800", marginBottom: "0.5rem", letterSpacing: "-0.025em" }}>Inventory Insights</h1>
                        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>Welcome back, administrator. Here's your inventory status.</p>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", position: "relative" }}>
                        <div style={{ position: "relative" }}>
                            <button 
                                onClick={() => setShowQuickActions(!showQuickActions)}
                                className="shimmer-btn"
                                style={{ backgroundColor: "var(--btn-secondary)", color: "var(--text-main)", border: "1px solid var(--border-color)", padding: "0.75rem 1.25rem", borderRadius: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
                            >
                                <Zap size={18} fill="var(--warning)" color="var(--warning)" /> Quick Action
                            </button>
                            
                            <AnimatePresence>
                                {showQuickActions && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                        className="glass"
                                        style={dropdownStyle}
                                    >
                                        <button onClick={() => { setShowProductModal(true); setShowQuickActions(false); }} className="dropdown-item">
                                            <PackagePlus size={16} color="var(--accent-color)" /> Add New Product
                                        </button>
                                        <button onClick={() => { setShowCategoryModal(true); setShowQuickActions(false); }} className="dropdown-item">
                                            <Tag size={16} color="var(--warning)" /> Add Category
                                        </button>
                                        <button onClick={() => { setShowImportModal(true); setShowQuickActions(false); }} className="dropdown-item">
                                            <BrainCircuit size={16} color="var(--accent-color)" /> AI Smart Scan
                                        </button>
                                        <div style={{ height: "1px", backgroundColor: "var(--border-color)", margin: "0.4rem 0" }} />
                                        <button onClick={handleExportData} className="dropdown-item">
                                            <FileDown size={16} color="var(--success)" /> Export Inventory
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button onClick={() => navigate("/products")} style={{ border: "1px solid var(--border-color)" }}>
                            <Package size={18} /> Manage Inventory
                        </button>
                    </div>
                </div>

                <motion.div 
                    variants={containerVariants}
                    style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}
                >
                    <motion.div variants={itemVariants}><SummaryCard title="Total Products" value={stats.totalProducts || 0} icon={Package} color="#38BDF8" /></motion.div>
                    <motion.div variants={itemVariants}><SummaryCard title="Inventory Worth" value={`Rp ${(stats.totalValue || 0).toLocaleString()}`} icon={CreditCard} color="#10B981" /></motion.div>
                    <motion.div variants={itemVariants}><SummaryCard title="Stock Health" value={`${stats.totalProducts ? Math.round((1 - (stats.lowStockCount / stats.totalProducts)) * 100) : 100}%`} icon={Zap} color="#F59E0B" /></motion.div>
                    <motion.div variants={itemVariants}><SummaryCard title="Low Stock Alert" value={stats.lowStockCount || 0} icon={AlertTriangle} color="#F87171" isLowStock={true} /></motion.div>
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "2rem", marginBottom: "2.5rem" }}
                >
                    <motion.div variants={itemVariants}><StockLevelsBarChart data={stats.topStockProducts} /></motion.div>
                    <motion.div variants={itemVariants}><CategoryDistributionPieChart data={stats.categoryDistribution} /></motion.div>
                </motion.div>

                <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
                    <RecentProductsTable products={stats.recentProducts} />
                </motion.div>
            </div>

            <AnimatePresence>
                {showProductModal && (
                    <div style={modalOverlayStyle}>
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass" style={modalStyle}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                                <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>Quick Add Product</h2>
                                <button onClick={() => setShowProductModal(false)} style={{ background: "transparent", color: "var(--text-muted)", padding: 0 }}><X /></button>
                            </div>
                            <form onSubmit={handleQuickAddProduct}>
                                <div style={fieldStyle}><label style={labelStyle}>Product Name</label><input value={productFormData.name} onChange={e => setProductFormData({ ...productFormData, name: e.target.value })} required /></div>
                                <div style={fieldStyle}><label style={labelStyle}>Category</label><select value={productFormData.category} onChange={e => setProductFormData({ ...productFormData, category: e.target.value })} required><option value="">Select a category</option>{categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
                                <div style={{ display: "flex", gap: "1rem" }}><div style={{ ...fieldStyle, flex: 1 }}><label style={labelStyle}>Price (Rp)</label><input type="number" value={productFormData.price} onChange={e => setProductFormData({ ...productFormData, price: e.target.value })} required /></div><div style={{ ...fieldStyle, flex: 1 }}><label style={labelStyle}>Stock</label><input type="number" value={productFormData.stock} onChange={e => setProductFormData({ ...productFormData, stock: e.target.value })} required /></div></div>
                                <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}><button type="button" onClick={() => setShowProductModal(false)} style={{ flex: 1, backgroundColor: "var(--btn-secondary)", color: "var(--text-main)" }}>Cancel</button><button type="submit" style={{ flex: 2 }}>Add Product</button></div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showCategoryModal && (
                    <div style={modalOverlayStyle}>
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass" style={modalStyle}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                                <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>Quick Add Category</h2>
                                <button onClick={() => setShowCategoryModal(false)} style={{ background: "transparent", color: "var(--text-muted)", padding: 0 }}><X /></button>
                            </div>
                            <form onSubmit={handleQuickAddCategory}>
                                <div style={fieldStyle}><label style={labelStyle}>Category Name</label><input value={categoryFormData.name} onChange={e => setCategoryFormData({ name: e.target.value })} required /></div>
                                <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}><button type="button" onClick={() => setShowCategoryModal(false)} style={{ flex: 1, backgroundColor: "var(--btn-secondary)", color: "var(--text-main)" }}>Cancel</button><button type="submit" style={{ flex: 2 }}>Add Category</button></div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showImportModal && (
                    <div style={modalOverlayStyle}>
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass" style={modalStyle}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                <h2 style={{ fontSize: "1.5rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <BrainCircuit size={24} color="var(--accent-color)" /> AI Smart Scan
                                </h2>
                                <button onClick={() => setShowImportModal(false)} style={{ background: "transparent", color: "var(--text-muted)", padding: 0 }}><X /></button>
                            </div>
                            
                            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                                Upload Excel berantakan atau tabel acak. AI akan otomatis menyortir barang, kategori, dan estimasi harga secara otomatis.
                            </p>

                            <form onSubmit={handleImportExcel}>
                                <div style={{ 
                                    border: `2px dashed ${importing ? 'var(--accent-color)' : 'var(--border-color)'}`, 
                                    borderRadius: "12px", padding: "2rem", textAlign: "center", marginBottom: "1.5rem", background: "rgba(255,255,255,0.02)"
                                }}>
                                    <input type="file" accept=".xlsx, .xls, .csv" onChange={e => setImportFile(e.target.files[0])} style={{ display: "none" }} id="ai-excel-upload" />
                                    <label htmlFor="ai-excel-upload" style={{ cursor: "pointer" }}>
                                        {importing ? <BrainCircuit className="spin" size={48} color="var(--accent-color)" style={{ marginBottom: "1rem" }} /> : <UploadCloud size={48} color="var(--accent-color)" style={{ marginBottom: "1rem" }} />}
                                        <p style={{ fontWeight: "600", color: "var(--text-main)" }}>{importFile ? importFile.name : "Pilih File Excel/Pivot Anda"}</p>
                                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>AI akan menyortir data Anda secara otomatis</p>
                                    </label>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", padding: "10px", borderRadius: "8px", background: "rgba(56, 189, 248, 0.1)" }}>
                                    <Check size={16} color="var(--accent-color)" />
                                    <span style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>AI Mode: <strong>Enabled</strong> (Auto-sort inventory items & tools)</span>
                                </div>

                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <button type="button" onClick={() => setShowImportModal(false)} disabled={importing} style={{ flex: 1, backgroundColor: "var(--btn-secondary)", color: "var(--text-main)" }}>Batal</button>
                                    <button type="submit" disabled={importing} style={{ flex: 2 }}>{importing ? "AI Sedang Menyortir..." : "Ekstrak & Simpan Data"}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const dropdownStyle = { position: "absolute", top: "100%", right: 0, marginTop: "0.5rem", width: "220px", padding: "0.5rem", borderRadius: "12px", zIndex: 1000, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", gap: "0.2rem" };
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)" };
const modalStyle = { 
    padding: "2.5rem", 
    borderRadius: "20px", 
    width: "100%", 
    maxWidth: "520px", 
    border: "1px solid var(--glass-border)", 
    color: "var(--text-main)",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
};
const fieldStyle = { marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" };
const labelStyle = { fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" };

export default Dashboard;
