import { Link, useNavigate } from "react-router-dom";
import { LogOut, Package, Tag, LayoutDashboard } from "lucide-react";

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <nav style={{
            backgroundColor: "var(--card-color)",
            padding: "1rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem"
        }}>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--accent-color)" }}>StockKeep</div>
            <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                <Link to="/dashboard" style={linkStyle}><LayoutDashboard size={20} /> Dashboard</Link>
                <Link to="/products" style={linkStyle}><Package size={20} /> Products</Link>
                <Link to="/categories" style={linkStyle}><Tag size={20} /> Categories</Link>
                <button onClick={handleLogout} style={{
                    backgroundColor: "transparent",
                    color: "var(--text-color)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0"
                }}>
                    <LogOut size={20} /> Logout
                </button>
            </div>
        </nav>
    );
};

const linkStyle = {
    color: "var(--text-color)",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.95rem",
    fontWeight: "500"
};

export default Navbar;
