import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";

const MainLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <motion.main 
                animate={{ paddingLeft: isCollapsed ? "80px" : "260px" }}
                transition={{ duration: 0.45, ease: [0.5, 0, 0, 1] }}
                style={{ 
                    flex: 1, 
                    marginLeft: "auto", 
                    width: "100%"
                }}
            >
                <Outlet />
            </motion.main>
        </div>
    );
};

export default MainLayout;
