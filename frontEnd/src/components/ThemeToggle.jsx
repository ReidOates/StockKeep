import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid var(--border-color)",
        color: "var(--text-main)",
        padding: "0.6rem",
        borderRadius: "10px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </motion.button>
  );
};

export default ThemeToggle;
