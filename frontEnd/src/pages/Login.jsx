import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-hot-toast";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data } = await api.post("/auth/login", { email, password });
            localStorage.setItem("token", data.token);
            toast.success("Welcome back!");
            navigate("/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "var(--bg-color)"
        }}>
            <form onSubmit={handleSubmit} style={{
                backgroundColor: "var(--card-color)",
                padding: "2.5rem",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "400px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                border: "1px solid var(--border-color)",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem"
            }}>
                <div style={{ textAlign: "center" }}>
                    <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--accent-color)", marginBottom: "0.5rem" }}>StockKeep</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Please sign in to continue</p>
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@example.com"
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--border-color)", backgroundColor: "rgba(255,255,255,0.03)", color: "var(--text-main)" }}
                        required
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--border-color)", backgroundColor: "rgba(255,255,255,0.03)", color: "var(--text-main)" }}
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        width: "100%", 
                        padding: "0.9rem", 
                        borderRadius: "10px", 
                        backgroundColor: "var(--accent-color)", 
                        color: "white", 
                        fontWeight: "700",
                        fontSize: "1rem",
                        marginTop: "1rem",
                        transition: "all 0.2s ease"
                    }}
                >
                    {loading ? "Signing in..." : "Login to System"}
                </button>
            </form>
        </div>
    );
};

export default Login;
