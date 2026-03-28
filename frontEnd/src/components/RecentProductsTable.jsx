import { motion } from "framer-motion";

const RecentProductsTable = ({ products = [] }) => {
    const getStatusInfo = (stock) => {
        if (stock === 0) return { label: "Out of Stock", color: "var(--danger)", bg: "rgba(239, 68, 68, 0.1)" };
        if (stock < 10) return { label: "Low Stock", color: "var(--warning)", bg: "rgba(245, 158, 11, 0.1)" };
        return { label: "In Stock", color: "var(--success)", bg: "rgba(16, 185, 129, 0.1)" };
    };

    return (
        <div className="glass" style={{
            padding: "1.75rem",
            borderRadius: "16px",
            gridColumn: "1 / -1"
        }}>
            <h3 style={{ 
                marginBottom: "1.5rem", 
                fontSize: "1.1rem", 
                fontWeight: "700", 
                color: "#FFFFFF" 
            }}>
                Recently Added Products
            </h3>
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 0.5rem", textAlign: "left" }}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Product Name</th>
                            <th style={thStyle}>Category</th>
                            <th style={thStyle}>Stock Level</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Price</th>
                            <th style={thStyle}>Date Added</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p, index) => {
                            const status = getStatusInfo(p.stock);
                            return (
                                <motion.tr 
                                    key={p._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    style={{ backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "8px" }}
                                >
                                    <td style={{ ...tdStyle, borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px", fontWeight: "600" }}>{p.name}</td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            backgroundColor: "rgba(56, 189, 248, 0.1)",
                                            color: "var(--accent-color)",
                                            padding: "0.25rem 0.6rem",
                                            borderRadius: "8px",
                                            fontSize: "0.75rem",
                                            fontWeight: "600"
                                        }}>
                                            {p.category?.name || "N/A"}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>{p.stock}</td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            backgroundColor: status.bg,
                                            color: status.color,
                                            padding: "0.25rem 0.6rem",
                                            borderRadius: "8px",
                                            fontSize: "0.75rem",
                                            fontWeight: "700",
                                            border: `1px solid ${status.color}20`
                                        }}>
                                            {status.label}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, color: "var(--accent-color)", fontWeight: "600" }}>
                                        ${(p.price || 0).toLocaleString()}
                                    </td>
                                    <td style={{ ...tdStyle, borderTopRightRadius: "8px", borderBottomRightRadius: "8px", color: "var(--text-muted)" }}>
                                        {new Date(p.createdAt).toLocaleDateString()}
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const thStyle = {
    padding: "1rem",
    color: "var(--text-muted)",
    fontSize: "0.75rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
};

const tdStyle = {
    padding: "1.25rem 1rem",
    fontSize: "0.9rem"
};

export default RecentProductsTable;
