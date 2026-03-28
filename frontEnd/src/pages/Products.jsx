import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { Plus, Trash2, Edit, Search, Filter, Download, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TableSkeleton } from "../components/Skeleton";
import { toast } from "react-hot-toast";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: "", price: "", stock: "", category: "" });
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [searchParams, setSearchParams] = useSearchParams();
    const filterParam = searchParams.get("filter");
    const searchParam = searchParams.get("search");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                api.get("/products"),
                api.get("/categories")
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching data", err);
            setLoading(false);
        }
    };

    const filteredProducts = useMemo(() => {
        let result = [...products];
        
        if (filterParam === "low-stock") {
            result = result.filter(p => p.stock < 10);
        }
        
        if (searchParam) {
            result = result.filter(p => 
                p.name.toLowerCase().includes(searchParam.toLowerCase()) ||
                p.category?.name?.toLowerCase().includes(searchParam.toLowerCase())
            );
        }
        
        return result;
    }, [products, filterParam, searchParam]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/products/${editId}`, formData);
            } else {
                await api.post("/products", formData);
            }
            toast.success(editId ? "Product updated!" : "Product created!");
            setShowModal(false);
            setEditId(null);
            setFormData({ name: "", price: "", stock: "", category: "" });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error saving product");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await api.delete(`/products/${id}`);
                toast.success("Product deleted");
                fetchData();
            } catch (err) {
                toast.error("Failed to delete product");
            }
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            price: product.price,
            stock: product.stock,
            category: product.category?._id || product.category
        });
        setEditId(product._id);
        setShowModal(true);
    };

    const exportToCSV = () => {
        const headers = ["Name", "Category", "Price", "Stock"];
        const rows = filteredProducts.map(p => [
            p.name,
            p.category?.name || "N/A",
            p.price,
            p.stock
        ]);
        
        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(r => r.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `products_export_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const clearFilters = () => {
        setSearchParams({});
    };

    const [selectedIds, setSelectedIds] = useState([]);

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredProducts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredProducts.map(p => p._id));
        }
    };

    const toggleSelectOne = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) {
            try {
                // Assuming the backend might not have a dedicated bulk delete, 
                // we iterate or use a specialized route if it exists.
                // Let's assume we have to iterate for now as per controller check earlier.
                await Promise.all(selectedIds.map(id => api.delete(`/products/${id}`)));
                toast.success(`${selectedIds.length} products deleted`);
                setSelectedIds([]);
                fetchData();
            } catch (err) {
                toast.error("Failed to delete some products");
            }
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: "2rem" }}
        >
            <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                    <div>
                        <h1 style={{ fontSize: "2rem", fontWeight: "800", letterSpacing: "-0.025em" }}>Product Inventory</h1>
                        <p style={{ color: "var(--text-muted)" }}>Control and manage your stock items in real-time.</p>
                    </div>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button onClick={exportToCSV} style={{ backgroundColor: "var(--input-bg)", color: "var(--text-main)", border: "1px solid var(--border-color)" }}>
                            <Download size={18} /> Export CSV
                        </button>
                        <button onClick={() => { setShowModal(true); setEditId(null); setFormData({ name: "", price: "", stock: "", category: "" }); }}
                        style={{ border: "1px solid var(--border-color)", backgroundColor: "var(--btn-secondary)" }}>
                            <Plus size={18} /> Add Product
                        </button>
                    </div>
                </div>

                {/* Bulk Actions Bar */}
                <AnimatePresence>
                    {selectedIds.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{ 
                                backgroundColor: "var(--accent-color)", 
                                color: "white", 
                                padding: "1rem 1.5rem", 
                                borderRadius: "12px", 
                                marginBottom: "1.5rem",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                boxShadow: "0 10px 15px -3px rgba(56, 189, 248, 0.4)"
                            }}
                        >
                            <div style={{ fontWeight: "700" }}>{selectedIds.length} items selected</div>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button 
                                    onClick={handleBulkDelete}
                                    style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", border: "none", padding: "0.5rem 1rem" }}
                                >
                                    <Trash2 size={16} /> Delete Selected
                                </button>
                                <button 
                                    onClick={() => setSelectedIds([])}
                                    style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.4)", padding: "0.5rem 1rem" }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Filters & Search */}
                <div className="glass" style={{ padding: "1.25rem", borderRadius: "12px", marginBottom: "2rem", display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                        <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input 
                            placeholder="Search products or categories..." 
                            value={searchParam || ""}
                            onChange={(e) => setSearchParams(prev => {
                                if (e.target.value) prev.set("search", e.target.value);
                                else prev.delete("search");
                                return prev;
                            })}
                            style={{ paddingLeft: "2.5rem" }}
                        />
                    </div>
                    {(filterParam || searchParam) && (
                        <button onClick={clearFilters} style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)" }}>
                             Clear <X size={16} />
                        </button>
                    )}
                </div>

                {filterParam === "low-stock" && (
                    <div style={{ 
                        backgroundColor: "rgba(245, 158, 11, 0.1)", 
                        border: "1px solid rgba(245, 158, 11, 0.2)",
                        color: "var(--warning)",
                        padding: "1rem",
                        borderRadius: "12px",
                        marginBottom: "1.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        fontWeight: "600"
                    }}>
                        <Filter size={18} /> Showing items with low stock level (less than 10)
                    </div>
                )}

                <div className="glass" style={{ overflow: "hidden", borderRadius: "16px" }}>
                    {loading ? (
                         <TableSkeleton rows={10} />
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border-color)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                                    <th style={{ ...thStyle, width: "50px" }}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th style={thStyle}>Product Details</th>
                                    <th style={thStyle}>Category</th>
                                    <th style={thStyle}>Unit Price</th>
                                    <th style={thStyle}>Stock</th>
                                    <th style={thStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length > 0 ? filteredProducts.map((p, index) => (
                                    <motion.tr 
                                        key={p._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        style={{ 
                                            borderBottom: "1px solid var(--border-color)",
                                            backgroundColor: selectedIds.includes(p._id) ? "rgba(56, 189, 248, 0.05)" : "transparent"
                                        }}
                                    >
                                        <td style={{ ...tdStyle, width: "50px" }}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.includes(p._id)}
                                                onChange={() => toggleSelectOne(p._id)}
                                            />
                                        </td>
                                        <td style={{ ...tdStyle, fontWeight: "600" }}>{p.name}</td>
                                        <td style={tdStyle}>
                                            <span style={{ backgroundColor: "rgba(56, 189, 248, 0.1)", color: "var(--accent-color)", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "600" }}>
                                                {p.category?.name || "N/A"}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, fontWeight: "600", color: "var(--text-main)" }}>${p.price.toLocaleString()}</td>
                                        <td style={tdStyle}>
                                            <span style={{ 
                                                color: p.stock < 10 ? "var(--danger)" : "var(--text-main)",
                                                fontWeight: p.stock < 10 ? "700" : "400"
                                            }}>
                                                {p.stock} units
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <button onClick={() => handleEdit(p)} style={actionBtnStyle}><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(p._id)} style={{ ...actionBtnStyle, backgroundColor: "rgba(239, 68, 68, 0.08)", color: "var(--danger)", border: "1px solid rgba(239, 68, 68, 0.15)" }}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>No products found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Professional Modal */}
                <AnimatePresence>
                    {showModal && (
                        <div style={modalOverlayStyle}>
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="glass"
                                style={modalStyle}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                                    <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>{editId ? "Update Product" : "New Product"}</h2>
                                    <button onClick={() => setShowModal(false)} style={{ background: "transparent", color: "var(--text-muted)", padding: 0 }}><X /></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div style={fieldStyle}>
                                        <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>Product Name</label>
                                        <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Wireless Mouse" />
                                    </div>
                                    <div style={fieldStyle}>
                                        <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>Category</label>
                                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                                            <option value="">Select a category</option>
                                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <div style={{ ...fieldStyle, flex: 1 }}>
                                            <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>Price ($)</label>
                                            <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                                        </div>
                                        <div style={{ ...fieldStyle, flex: 1 }}>
                                            <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>Initial Stock</label>
                                            <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                                        <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.05)", color: "white" }}>Cancel</button>
                                        <button type="submit" style={{ flex: 2 }}>{editId ? "Update Product" : "Create Product"}</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const thStyle = { padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" };
const tdStyle = { padding: "1.25rem 1.5rem", fontSize: "0.9rem" };
const actionBtnStyle = { 
  backgroundColor: "rgba(14, 165, 233, 0.1)", 
  color: "var(--text-main)", // Perubahan: Putih di Gelap, Hitam di Terang
  padding: "0.5rem", 
  borderRadius: "10px", 
  border: "1px solid var(--border-color)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s"
};
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)" };
const modalStyle = { padding: "2.5rem", borderRadius: "20px", width: "100%", maxWidth: "500px", border: "1px solid var(--glass-border)" };
const fieldStyle = { marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" };

export default Products;
