// Lucide icons are passed as props, no need to import the type in JS

import { motion } from "framer-motion";
import { TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SummaryCard = ({ title, value, icon: Icon, color, isLowStock }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (isLowStock) {
            navigate("/products?filter=low-stock");
        }
    };

    return (
        <motion.div 
            whileHover={{ 
                y: -10, 
                boxShadow: `0 20px 25px -5px ${color}33, 0 8px 10px -6px ${color}33`,
                borderColor: color
            }}
            transition={{ duration: 0.4, cubicBezier: [0.4, 0, 0.2, 1] }}
            onClick={handleClick}
            className="glass card-hover"
            style={{
                padding: "1.5rem",
                borderRadius: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                cursor: isLowStock ? "pointer" : "default",
                position: "relative",
                overflow: "hidden",
                border: "1px solid var(--border-color)",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)"
            }}
        >
            {/* Background Glow */}
            <div style={{
                position: "absolute",
                top: "-20%",
                right: "-10%",
                width: "140px",
                height: "140px",
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                filter: "blur(40px)",
                opacity: 0.2,
                zIndex: 0,
                transition: "all 0.5s ease"
            }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 1 }}>
                <div style={{
                    backgroundColor: `${color}15`, // Transparan sesuai warna ikon
                    padding: "0.85rem",
                    borderRadius: "14px",
                    color: color,
                    border: `1.5px solid ${color}30`,
                    boxShadow: `0 0 15px ${color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                {isLowStock && (
                    <div style={{ 
                        backgroundColor: "var(--danger-bg)", 
                        color: "var(--danger)",
                        fontSize: "0.7rem",
                        fontWeight: "700",
                        padding: "0.25rem 0.6rem",
                        borderRadius: "20px",
                        textTransform: "uppercase"
                    }}>
                        Action Required
                    </div>
                )}
            </div>

            <div style={{ zIndex: 1 }}>
                <p style={{ 
                    color: "var(--text-muted)", 
                    fontSize: "0.9rem", 
                    fontWeight: "500",
                    marginBottom: "0.25rem"
                }}>
                    {title}
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                    <h3 style={{ 
                        fontSize: "1.85rem", 
                        fontWeight: "700", 
                        color: "var(--text-main)",
                        margin: 0,
                        letterSpacing: "-0.025em"
                    }}>
                        {value}
                    </h3>
                    {!isLowStock && (
                        <span style={{ color: "var(--success)", fontSize: "0.8rem", fontWeight: "600", display: "flex", alignItems: "center" }}>
                            <TrendingUp size={12} style={{ marginRight: "2px" }} /> +2.4%
                        </span>
                    )}
                </div>
            </div>

            {isLowStock && (
                <div style={{ 
                    marginTop: "auto", 
                    fontSize: "0.8rem", 
                    color: "var(--accent-color)", 
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem"
                }}>
                    View Low Stock <ArrowRight size={14} />
                </div>
            )}
        </motion.div>
    );
};

export default SummaryCard;
