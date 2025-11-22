import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line,CartesianGrid, } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

function Dashboard() {
    const [stats, setStats] = useState({
        total_items: 0,
        low_stock_count: 0,
        movement_stats: [],
        adjustment_reasons: [],
        weekly_activity: []
    });

    useEffect(() => {
        fetch('http://localhost:8081/dashboard-stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div style={{ padding: '20px', background: '#f4f6f8', minHeight: '100vh' }}>
            <h1>Warehouse Analytics</h1>

            {/* --- KPI CARDS (The Big Numbers) --- */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                <Card title="Total Items in Stock" value={Number(stats.total_items)} color="#0088FE" />
                <Card title="Low Stock Alerts" value={stats.low_stock_count} color="#FF8042" />
                <Card title="Total Transactions" value={stats.movement_stats.reduce((acc, curr) => acc + curr.value, 0)} color="#00C49F" />
            </div>

            {/* --- CHARTS SECTION --- */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                
                {/* Chart 1: Activity Mix */}
                <div style={{ flex: 1, minWidth: '300px', background: 'white', padding: '20px', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <h3>Warehouse Activity Mix</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={stats.movement_stats.map(item => ({
                                    ...item, 
                                    name: capitalize(item.name) 
                                }))}
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

                {/* Chart 2: Why are we adjusting? (Audit Reasons) */}
                <div style={{ flex: 1, minWidth: '300px', background: 'white', padding: '20px', marginBottom: '20px',borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <h3>Audit Reasons (Loss Analysis)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.adjustment_reasons}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
            </div>
            {/* Chart 3: Activity Trend (Line Chart) */}
                <div style={{ flex: 1, minWidth: '300px', background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <h3>Weekly Activity Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.weekly_activity}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#8884d8" 
                                strokeWidth={3}
                                activeDot={{ r: 8 }} 
                                name="Transactions"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
        </div>
        
    );
}

// Simple Helper Component for the Cards
function Card({ title, value, color }) {
    return (
        <div style={{ 
            flex: 1, 
            background: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            borderLeft: `5px solid ${color}`,
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>{title}</h4>
            <h2 style={{ margin: 0, fontSize: '2rem' }}>{value}</h2>
        </div>
    );
}

export default Dashboard;