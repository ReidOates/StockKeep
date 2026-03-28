import { useState, useEffect, useCallback } from "react";
import { Search, Package, Tag, X, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ products: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Command Palette Keyboard Shortcut
  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
    if (e.key === "Escape") setIsOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Search Logic
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults({ products: [], categories: [] });
        return;
      }
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get(`/products?search=${query}`),
          api.get("/categories"),
        ]);
        
        const filteredProds = prodRes.data.slice(0, 5);
        const filteredCats = catRes.data.filter(c => 
            c.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3);

        setResults({ products: filteredProds, categories: filteredCats });
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <>
      {/* Search Trigger Button for Sidebar/Header */}
      <button 
        onClick={() => setIsOpen(true)}
        style={triggerButtonStyle}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Search size={16} />
          <span style={{ fontSize: "0.85rem" }}>Quick Search...</span>
        </div>
        <div style={kbdStyle}>
          <Command size={10} /> K
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div style={overlayStyle} onClick={() => setIsOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              style={modalStyle}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={searchHeaderStyle}>
                <Search size={20} style={{ color: "var(--text-muted)" }} />
                <input 
                  autoFocus
                  placeholder="Search products, categories, or actions..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={inputStyle}
                />
                <button onClick={() => setIsOpen(false)} style={closeButtonStyle}>
                  <X size={18} />
                </button>
              </div>

              <div style={resultsContainerStyle}>
                {!query && !loading && (
                  <div style={emptyStateStyle}>
                      <Command size={24} style={{ marginBottom: "0.5rem", opacity: 0.5 }} />
                      <p>Type to search your inventory...</p>
                  </div>
                )}

                {loading && <div style={loadingStyle}>Searching...</div>}

                {results.products.length > 0 && (
                  <div style={sectionStyle}>
                    <h3 style={sectionTitleStyle}>Products</h3>
                    {results.products.map(p => (
                      <div 
                        key={p._id} 
                        style={resultItemStyle}
                        onClick={() => handleNavigate(`/products?search=${p.name}`)}
                      >
                        <Package size={16} style={{ color: "var(--accent-color)" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "600" }}>{p.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{p.category?.name} • {p.stock} units</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {results.categories.length > 0 && (
                  <div style={sectionStyle}>
                    <h3 style={sectionTitleStyle}>Categories</h3>
                    {results.categories.map(c => (
                      <div 
                        key={c._id} 
                        style={resultItemStyle}
                        onClick={() => handleNavigate("/categories")}
                      >
                        <Tag size={16} style={{ color: "var(--warning)" }} />
                        <span>{c.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {query && !loading && results.products.length === 0 && results.categories.length === 0 && (
                  <div style={emptyStateStyle}>No results found for "{query}"</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

// Styles
const triggerButtonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  padding: "0.75rem 1rem",
  background: "var(--btn-secondary)",
  border: "1px solid var(--border-color)",
  borderRadius: "12px",
  color: "var(--text-main)",
  cursor: "pointer",
  marginBottom: "1.5rem",
  textAlign: "left"
};

const kbdStyle = {
  display: "flex",
  alignItems: "center",
  gap: "2px",
  background: "var(--border-color)",
  padding: "2px 6px",
  borderRadius: "4px",
  fontSize: "0.7rem",
  fontWeight: "700",
  opacity: 0.7,
  color: "var(--text-main)"
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  paddingTop: "100px",
  zIndex: 2000,
  backdropFilter: "blur(6px)"
};

const modalStyle = {
  width: "100%",
  maxWidth: "600px",
  height: "fit-content",
  maxHeight: "500px",
  backgroundColor: "var(--sidebar-color)",
  borderRadius: "16px",
  border: "1px solid var(--glass-border)",
  overflow: "hidden",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
};

const searchHeaderStyle = {
  display: "flex",
  alignItems: "center",
  padding: "1.25rem",
  borderBottom: "1px solid var(--border-color)",
  gap: "1rem",
  backgroundColor: "var(--bg-color)"
};

const inputStyle = {
  flex: 1,
  background: "transparent",
  border: "none",
  color: "var(--text-main)",
  fontSize: "1.1rem",
  outline: "none",
  padding: "0.5rem 0"
};

const closeButtonStyle = {
  background: "transparent",
  color: "var(--text-muted)",
  padding: "0.25rem",
};

const resultsContainerStyle = {
  padding: "1rem",
  overflowY: "auto",
  maxHeight: "380px"
};

const sectionStyle = {
  marginBottom: "1.5rem"
};

const sectionTitleStyle = {
  fontSize: "0.75rem",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  letterSpacing: "0.05em",
  marginBottom: "0.75rem",
  marginLeft: "0.5rem"
};

const resultItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "0.75rem 1rem",
  borderRadius: "10px",
  cursor: "pointer",
  transition: "all 0.2s",
  color: "var(--text-main)",
  backgroundColor: "var(--skeleton-bg)",
};

const loadingStyle = {
  padding: "2rem",
  textAlign: "center",
  color: "var(--text-muted)"
};

const emptyStateStyle = {
  padding: "3rem 1rem",
  textAlign: "center",
  color: "var(--text-muted)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
};

export default GlobalSearch;
