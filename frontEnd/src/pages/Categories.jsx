import { useEffect, useState } from "react";
import api from "../api/axios";
import { Plus, Trash2, Edit, X, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TableSkeleton } from "../components/Skeleton";
import { toast } from "react-hot-toast";

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: "" });
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get("/categories");
            setCategories(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching categories", err);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/categories/${editId}`, formData);
            } else {
                await api.post("/categories", formData);
            }
            toast.success(editId ? "Category updated!" : "Category created!");
            setShowModal(false);
            setEditId(null);
            setFormData({ name: "" });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error saving category");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? This will not delete products in this category but will leave them without a category.")) {
            try {
                await api.delete(`/categories/${id}`);
                toast.success("Category deleted");
                fetchData();
            } catch (err) {
                toast.error("Failed to delete category");
            }
        }
    };

    const handleEdit = (category) => {
        setFormData({ name: category.name });
        setEditId(category._id);
        setShowModal(true);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: "2rem" }}
        >
            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                    <div>
                        <h1 style={{ fontSize: "2rem", fontWeight: "800", letterSpacing: "-0.025em" }}>Categories</h1>
                        <p style={{ color: "var(--text-muted)" }}>Organize your products with professional classification.</p>
                    </div>
                    <button onClick={() => { setShowModal(true); setEditId(null); setFormData({ name: "" }); }}
                        style={{ border: "1px solid var(--border-color)", backgroundColor: "var(--btn-secondary)" }}>
                        <Plus size={18} /> Add Category
                    </button>
                </div>

                <div className="glass" style={{ borderRadius: "20px", overflow: "hidden" }}>
                    {loading ? (
                        <TableSkeleton rows={6} />
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border-color)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                                    <th style={thStyle}>Category Name</th>
                                    <th style={thStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length > 0 ? categories.map((c, index) => (
                                    <motion.tr 
                                        key={c._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        style={{ borderBottom: "1px solid var(--border-color)" }}
                                    >
                                        <td style={{ ...tdStyle, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <div style={{ padding: "0.5rem", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.1)", color: "var(--accent-color)" }}>
                                                <Tag size={16} />
                                            </div>
                                            <span style={{ fontWeight: "600" }}>{c.name}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <button onClick={() => handleEdit(c)} style={actionBtnStyle}><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(c._id)} style={{ ...actionBtnStyle, color: "var(--danger)" }}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <tr>
                                        <td colSpan="2" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>No categories found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

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
                                    <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>{editId ? "Update Category" : "New Category"}</h2>
                                    <button onClick={() => setShowModal(false)} style={{ background: "transparent", color: "var(--text-muted)", padding: 0 }}><X /></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div style={fieldStyle}>
                                        <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>Category Name</label>
                                        <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Electronics" />
                                    </div>
                                    <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                                        <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.05)", color: "white" }}>Cancel</button>
                                        <button type="submit" style={{ flex: 2 }}>{editId ? "Update Category" : "Create Category"}</button>
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

const thStyle = { padding: "1.25rem 1.75rem", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" };
const tdStyle = { padding: "1.25rem 1.75rem", fontSize: "0.95rem" };
const actionBtnStyle = { 
    backgroundColor: "rgba(14, 165, 233, 0.1)", 
    color: "var(--text-main)", 
    padding: "0.5rem", 
    borderRadius: "10px", 
    border: "1px solid var(--border-color)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s"
};
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)" };
const modalStyle = { padding: "2.5rem", borderRadius: "20px", width: "100%", maxWidth: "450px", border: "1px solid var(--glass-border)" };
const fieldStyle = { marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" };

export default Categories;
