import React, { useEffect, useState } from 'react';
import { 
    PieChart, Pie, Cell, 
    BarChart, Bar, 
    LineChart, Line, CartesianGrid, 
    XAxis, YAxis, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Helper to Capitalize first letter
const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

function Dashboard() {
    const [stats, setStats] = useState({
        total_items: 0,
        low_stock_count: 0,
        low_stock_items: [], 
        movement_stats: [],
        adjustment_reasons: [],
        weekly_activity: []
    });

    useEffect(() => {
        fetch('http://localhost:8081/dashboard-stats')
            .then(res => res.json())
            .then(data => {
                console.log("Dashboard Data:", data); 
                setStats(data);
            })
            .catch(err => console.error("Error fetching stats:", err));
    }, []);

    return (
        <div style={{ padding: '20px', background: '#f4f6f8', minHeight: '100vh' }}>
            <h1 style={{ color: '#333' }}>📊 Warehouse Analytics</h1>

            {/* --- KPI CARDS --- */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
                <Card 
                    title="Total Items in Stock" 
                    value={Number(stats.total_items)} 
                    color="#0088FE" 
                />
                
                <Card 
                    title="Low Stock Alerts" 
                    value={stats.low_stock_count} 
                    color="#FF8042" 
                    details={stats.low_stock_items} 
                />
                
                <Card 
                    title="Total Transactions" 
                    value={stats.movement_stats.reduce((acc, curr) => acc + curr.value, 0)} 
                    color="#00C49F" 
                />
            </div>

            {/* --- CHARTS ROW 1: Mix & Reasons (Side by Side) --- */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                
                {/* Pie Chart */}
                <div style={{ flex: 1, minWidth: '300px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <h3>Warehouse Activity Mix</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={stats.movement_stats.map(item => ({ ...item, name: capitalize(item.name) }))}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label
                            >
                                {stats.movement_stats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div style={{ flex: 1, minWidth: '300px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <h3>Audit Reasons</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.adjustment_reasons.map(item => ({ ...item, name: capitalize(item.name) }))}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* --- CHARTS ROW 2: Trends (Full Width) --- */}
            <div style={{ width: '100%', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
                <h3>Weekly Activity Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.weekly_activity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
}

// --- THE CARD COMPONENT ---
function Card({ title, value, color, details }) {
    const [isHovered, setIsHovered] = useState(false);
    const hasDetails = details && details.length > 0;

    return (
        <div 
            style={{ 
                flex: 1, 
                minWidth: '250px',
                background: 'white', 
                padding: '20px', 
                borderRadius: '8px', 
                borderLeft: `5px solid ${color}`,
                boxShadow: isHovered ? '0 8px 20px rgba(0,0,0,0.15)' : '0 2px 5px rgba(0,0,0,0.1)',
                position: 'relative', 
                cursor: hasDetails ? 'help' : 'default',
                transition: 'all 0.2s ease',
                zIndex: isHovered ? 1000 : 1 
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>{title}</h4>
            <h2 style={{ margin: 0, fontSize: '2rem' }}>{value}</h2>
            
            {hasDetails && (
                <div style={{ fontSize: '12px', color: color, marginTop: '5px', fontWeight: 'bold' }}>
                   Hover for details
                </div>
            )}

            {isHovered && hasDetails && (
                <div style={{
                    position: 'absolute',
                    top: '110%', 
                    left: 0,
                    width: '100%', 
                    background: 'white',
                    border: '1px solid #eee',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    borderRadius: '8px',
                    padding: '15px',
                    boxSizing: 'border-box'
                }}>
                    <strong style={{ fontSize: '12px', color: '#333', display: 'block', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                        ⚠️ Needs Attention:
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none' }}>
                        {details.map((item, idx) => (
                            <li key={idx} style={{ 
                                marginBottom: '6px', 
                                fontSize: '13px', 
                                color: '#555',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <span>{item.name}</span>
                                <span style={{ color: '#d9534f', fontWeight: 'bold', background: '#fff0f0', padding: '0 5px', borderRadius: '4px' }}>
                                    Qty: {item.initial_stock}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Dashboard;