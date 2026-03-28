import { motion } from "framer-motion";

export const Skeleton = ({ width = "100%", height = "1rem", borderRadius = "4px", marginBottom = "0" }) => {
    return (
        <motion.div
            animate={{
                opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
            }}
            style={{
                width,
                height,
                borderRadius,
                marginBottom,
                backgroundColor: "var(--skeleton-bg)",
            }}
        />
    );
};

export const CardSkeleton = () => (
    <div className="glass" style={{ padding: "1.5rem", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Skeleton width="40px" height="40px" borderRadius="12px" />
        </div>
        <div>
            <Skeleton width="60%" height="0.9rem" marginBottom="0.5rem" />
            <Skeleton width="40%" height="1.8rem" />
        </div>
    </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
    <div className="glass" style={{ borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.75rem", borderBottom: "1px solid var(--border-color)", backgroundColor: "rgba(255,255,255,0.02)" }}>
            <Skeleton width="200px" height="1rem" />
        </div>
        <div style={{ padding: "1.75rem" }}>
            {[...Array(rows)].map((_, i) => (
                <div key={i} style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                    <Skeleton width="30%" height="1rem" />
                    <Skeleton width="20%" height="1rem" />
                    <Skeleton width="20%" height="1rem" />
                    <Skeleton width="15%" height="1rem" />
                    <Skeleton width="10%" height="1rem" />
                </div>
            ))}
        </div>
    </div>
);
