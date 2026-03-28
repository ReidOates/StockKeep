import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    AreaChart,
    Area
} from "recharts";
import { useNavigate } from "react-router-dom";

const CHART_COLORS = ["#38BDF8", "#818CF8", "#C084FC", "#F472B6", "#FB7185"];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass" style={{ 
                padding: "1rem", 
                borderRadius: "12px", 
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.15)",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--sidebar-color)"
            }}>
                <p style={{ fontWeight: "700", marginBottom: "0.5rem", color: "var(--text-main)" }}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color, fontSize: "0.85rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: entry.color }} />
                        {entry.name}: <span style={{ fontWeight: "700", color: "var(--text-main)" }}>{entry.value.toLocaleString()}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const StockLevelsBarChart = ({ data = [] }) => {
    const navigate = useNavigate();

    const handleClick = (data) => {
        if (data && data.activePayload && data.activePayload[0]) {
            const product = data.activePayload[0].payload;
            // Navigate to products with search query of this product name for "focus"
            navigate(`/products?search=${encodeURIComponent(product.name)}`);
        }
    };

    return (
        <div className="glass" style={chartContainerStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={chartTitleStyle}>Inventory Distribution</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "500" }}>Click bars to manage</span>
            </div>
            <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                    <BarChart 
                        data={data} 
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                        onClick={handleClick}
                    >
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#38BDF8" stopOpacity={1} />
                                <stop offset="100%" stopColor="#818CF8" stopOpacity={0.8} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                        <XAxis 
                            dataKey="name" 
                            stroke="var(--text-muted)" 
                            fontSize={11} 
                            tickLine={false}
                            axisLine={false}
                            tick={{ dy: 10 }}
                        />
                        <YAxis 
                            stroke="var(--text-muted)" 
                            fontSize={11} 
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => value.toLocaleString()}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--btn-secondary)" }} />
                        <Bar 
                            dataKey="stock" 
                            fill="url(#barGradient)" 
                            radius={[6, 6, 0, 0]} 
                            barSize={40}
                            style={{ cursor: "pointer" }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const CategoryDistributionPieChart = ({ data = [] }) => {
    return (
        <div className="glass" style={chartContainerStyle}>
            <h3 style={chartTitleStyle}>Market Share by Category</h3>
            <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={CHART_COLORS[index % CHART_COLORS.length]} 
                                    style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.2))" }}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                            verticalAlign="bottom" 
                            height={36} 
                            iconType="circle"
                            formatter={(value) => <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "500" }}>{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const chartContainerStyle = {
    padding: "1.75rem",
    borderRadius: "16px",
};

const chartTitleStyle = {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "var(--text-main)",
    letterSpacing: "-0.01em"
};
