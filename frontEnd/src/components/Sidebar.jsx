import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
    LayoutDashboard, 
    Package, 
    Tag, 
    LogOut, 
    ChevronLeft, 
    ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlobalSearch from "./GlobalSearch";
import ThemeToggle from "./ThemeToggle";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const menuItems = [
        { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
        { path: "/products", name: "Products", icon: Package },
        { path: "/categories", name: "Categories", icon: Tag },
    ];

    return (
        <motion.div 
            initial={false}
            animate={{ width: isCollapsed ? "80px" : "260px" }}
            transition={{ duration: 0.45, ease: [0.5, 0, 0, 1] }}
            style={{
                height: "100vh",
                backgroundColor: "var(--sidebar-color)",
                borderRight: "1px solid var(--border-color)",
                display: "flex",
                flexDirection: "column",
                position: "fixed",
                left: 0,
                top: 0,
                zIndex: 100,
                overflow: "hidden" // Tambahan penting: Clip segalanya selama transisi
            }}
        >
            {/* Logo Section */}
            <div style={{ 
                padding: "1.5rem", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: isCollapsed ? "center" : "space-between",
                marginBottom: "0.5rem"
            }}>
                <div style={{ 
                    flex: 1, 
                    display: "flex", 
                    alignItems: "center", 
                    overflow: "hidden", 
                    whiteSpace: "nowrap",
                    opacity: isCollapsed ? 0 : 1,
                    transition: "opacity 0.3s ease",
                    visibility: isCollapsed ? "hidden" : "visible"
                }}>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isCollapsed ? 0 : 1 }}
                        style={{ fontSize: "1.6rem", fontWeight: "800", background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.02em" }}
                    >
                        StockKeep
                    </motion.div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "none",
                            borderRadius: "8px",
                            padding: "0.5rem",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>
            </div>

            <div style={{ 
                padding: "0 1rem 1.5rem 1rem", 
                opacity: isCollapsed ? 0 : 1, 
                transition: "opacity 0.3s ease",
                pointerEvents: isCollapsed ? "none" : "auto",
                overflow: "hidden"
            }}>
                <GlobalSearch />
            </div>

            <div style={{ 
                padding: "0 1rem 2rem 1rem",
                opacity: isCollapsed ? 0 : 1,
                transition: "opacity 0.3s ease",
                overflow: "hidden",
                whiteSpace: "nowrap"
            }}>
                <div style={{ 
                    backgroundColor: "rgba(255,255,255,0.03)", 
                    borderRadius: "12px", 
                    padding: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem"
                }}>
                    <div style={{ 
                        width: "40px", 
                        height: "40px", 
                        borderRadius: "10px", 
                        background: "var(--accent-gradient)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        color: "white"
                    }}>
                        AD
                    </div>
                    <div>
                        <div style={{ fontSize: "0.9rem", fontWeight: "600", whiteSpace: "nowrap", color: "var(--text-main)" }}>Admin User</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Premium Access</div>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <nav style={{ flex: 1, padding: "0 0.75rem" }}>
                <div style={{ 
                    fontSize: "0.75rem", 
                    fontWeight: "600", 
                    color: "var(--text-muted)", 
                    textTransform: "uppercase", 
                    letterSpacing: "0.05em",
                    padding: isCollapsed ? "0" : "0 1rem",
                    marginBottom: "0.5rem",
                    textAlign: isCollapsed ? "center" : "left"
                }}>
                    {isCollapsed ? "..." : "Navigation"}
                </div>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            style={{
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: isCollapsed ? "center" : "flex-start",
                                gap: "1rem",
                                padding: "0.9rem 1.1rem",
                                borderRadius: "14px",
                                marginBottom: "0.5rem",
                                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                backgroundColor: isActive ? "rgba(14, 165, 233, 0.12)" : "transparent",
                                color: isActive ? "var(--accent-color)" : "var(--text-muted)",
                                border: isActive ? "1px solid rgba(14, 165, 233, 0.25)" : "1px solid transparent",
                                boxShadow: isActive ? "0 4px 12px rgba(14, 165, 233, 0.15)" : "none",
                                position: "relative"
                            }}
                            className="sidebar-link"
                        >
                            {isActive && (
                                <motion.div 
                                    layoutId="active-pill"
                                    style={{ 
                                        position: "absolute", 
                                        left: 0, 
                                        width: "4px", 
                                        height: "60%", 
                                        backgroundColor: "var(--accent-color)",
                                        borderRadius: "0 4px 4px 0",
                                        boxShadow: "0 0 10px var(--accent-color)"
                                    }} 
                                />
                            )}
                            <item.icon size={22} style={{ minWidth: "22px", filter: isActive ? "drop-shadow(0 0 5px var(--accent-color))" : "none" }} />
                            <motion.span 
                                animate={{ 
                                    opacity: isCollapsed ? 0 : 1,
                                    width: isCollapsed ? 0 : "auto",
                                    marginLeft: isCollapsed ? 0 : "1rem"
                                }}
                                style={{ 
                                    fontWeight: isActive ? "700" : "500", 
                                    fontSize: "0.95rem",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                {item.name}
                            </motion.span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div style={{ padding: "1.5rem 0.75rem", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {!isCollapsed && (
                    <div style={{ display: "flex", justifyContent: isCollapsed ? "center" : "flex-start", padding: "0 0.5rem" }}>
                        <ThemeToggle />
                    </div>
                )}
                <button 
                    onClick={handleLogout}
                    style={{
                        width: "100%",
                        backgroundColor: "var(--btn-secondary)",
                        color: "var(--danger)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: isCollapsed ? "center" : "flex-start",
                        gap: "1rem",
                        padding: "0.85rem 1rem",
                        borderRadius: "10px",
                        fontWeight: "600",
                        border: "1px solid var(--border-color)"
                    }}
                >
                    <LogOut size={22} style={{ minWidth: "22px" }} />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </motion.div>
    );
};

export default Sidebar;
