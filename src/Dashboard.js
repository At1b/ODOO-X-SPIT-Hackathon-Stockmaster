import React, { useEffect, useState, useRef } from 'react';
import { 
    PieChart, Pie, Cell, 
    BarChart, Bar, 
    LineChart, Line, CartesianGrid, 
    XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
    LabelList // <--- IMPORTED THIS
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
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
    const [stockList, setStockList] = useState([]); 
    const reportRef = useRef(); 

    useEffect(() => {
        fetch('http://localhost:8081/dashboard-stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Error stats:", err));

        fetch('http://localhost:8081/stock')
            .then(res => res.json())
            .then(data => setStockList(data))
            .catch(err => console.error("Error stock:", err));
    }, []);

    const generateInsights = () => {
        const insights = [];
        if (stats.low_stock_count > 5) {
            insights.push(`⚠️ CRITICAL: High number of low stock items (${stats.low_stock_count}). Immediate reordering required.`);
        } else if (stats.low_stock_count > 0) {
            insights.push(`ℹ️ Attention: ${stats.low_stock_count} items are below threshold.`);
        } else {
            insights.push(`✅ Stock Health is excellent. No shortages detected.`);
        }
        
        const theft = stats.adjustment_reasons.find(r => r.name.toLowerCase().includes('theft'));
        if (theft && theft.value > 2) insights.push(`🚨 SECURITY ALERT: "Theft" accounts for ${theft.value} adjustments.`);
        
        const receipts = stats.movement_stats.find(m => m.name === 'receipt')?.value || 0;
        const deliveries = stats.movement_stats.find(m => m.name === 'delivery')?.value || 0;
        if (receipts > deliveries * 1.5) insights.push(`📈 STOCKING PHASE: Incoming goods significantly exceed outgoing.`);
        
        return insights;
    };

    const downloadPDF = async () => {
        const element = reportRef.current;
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Warehouse_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div style={{ padding: '20px', background: '#f4f6f8', minHeight: '100vh', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ color: '#333', margin: 0 }}>Warehouse Analytics</h1>
                <button 
                    onClick={downloadPDF}
                    style={{
                        background: '#2c3e50', color: 'white', border: 'none', padding: '10px 20px', 
                        borderRadius: '5px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    📥 Download PDF Report
                </button>
            </div>

            {/* --- VISIBLE DASHBOARD --- */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
                <Card title="Total Items" value={Number(stats.total_items)} color="#0088FE" />
                <Card title="Low Stock Alerts" value={stats.low_stock_count} color="#FF8042" details={stats.low_stock_items} />
                <Card title="Total Transactions" value={stats.movement_stats.reduce((acc, c) => acc + c.value, 0)} color="#00C49F" />
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <ChartBox title="Activity Mix">
                    <PieChart>
                        <Pie data={stats.movement_stats.map(i => ({...i, name: capitalize(i.name)}))} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                            {stats.movement_stats.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip /><Legend />
                    </PieChart>
                </ChartBox>
                
                <ChartBox title="Audit Reasons">
                    <BarChart 
                        data={stats.adjustment_reasons.map(i => ({...i, name: capitalize(i.name)}))}
                        margin={{ top: 20 }} // Add space for the label on top
                    >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#82ca9d">
                            {/* SHOW COUNT ON TOP OF BAR */}
                            <LabelList dataKey="value" position="top" />
                        </Bar>
                    </BarChart>
                </ChartBox>
            </div>

            <div style={{ width: '100%', background: 'white', padding: '20px', borderRadius: '8px' }}>
                <h3>Weekly Activity Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.weekly_activity}>
                        <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis allowDecimals={false} /><Tooltip /><Legend />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* ---  HIDDEN REPORT TEMPLATE (Optimized for PDF) --- */}
            <div ref={reportRef} style={{ 
                position: 'absolute', left: '-9999px', top: 0, width: '800px',
                background: 'white', padding: '40px', fontFamily: 'Arial, sans-serif', color: '#333'
            }}>
                {/* HEADER */}
                <div style={{ borderBottom: '2px solid #34495e', paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '24px' }}>Monthly Inventory Report</h1>
                        <span style={{ color: '#7f8c8d', fontSize: '12px' }}>Generated: {new Date().toLocaleString()}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ margin: 0, color: '#e74c3c' }}>{stats.low_stock_count} Alerts</h2>
                        <small>Requires Attention</small>
                    </div>
                </div>

                {/* EXECUTIVE SUMMARY */}
                <div style={{ background: '#f0f7fb', padding: '15px', borderRadius: '4px', marginBottom: '20px', borderLeft: '4px solid #3498db' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#2980b9', fontSize: '16px' }}>🧠 AI Executive Summary</h3>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {generateInsights().map((insight, idx) => (
                            <li key={idx} style={{ marginBottom: '5px', fontSize: '12px' }}>{insight}</li>
                        ))}
                    </ul>
                </div>

                {/* GRAPHS ROW */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ flex: 1, border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
                        <h4 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>Activity Mix</h4>
                        <div style={{ height: '150px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={stats.movement_stats} dataKey="value" cx="50%" cy="50%" outerRadius={50}>
                                        {stats.movement_stats.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px', fontSize: '10px' }}>
                            {stats.movement_stats.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '8px', height: '8px', background: COLORS[idx % COLORS.length] }}></div>
                                    <span>{capitalize(item.name)}: {item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ flex: 1, border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
                        <h4 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>Audit Reasons</h4>
                        <div style={{ height: '150px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.adjustment_reasons} margin={{ top: 20 }}>
                                    <Bar dataKey="value" fill="#82ca9d">
                                        {/* SHOW COUNT ON PDF AS WELL */}
                                        <LabelList dataKey="value" position="top" style={{ fontSize: '10px' }} />
                                    </Bar>
                                    <XAxis dataKey="name" tick={{fontSize: 8}} interval={0} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '5px', color: '#666' }}>
                            Total Adjustments: {stats.adjustment_reasons.reduce((a,b)=>a+b.value,0)}
                        </div>
                    </div>
                </div>

                {/* --- CRITICAL ALERTS SECTION --- */}
                {stats.low_stock_items.length > 0 && (
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ borderBottom: '1px solid #e74c3c', paddingBottom: '5px', marginBottom: '10px', color: '#c0392b' }}>⚠️ Critical Stock Warnings</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                            <thead>
                                <tr style={{ background: '#e74c3c', color: 'white', textAlign: 'left' }}>
                                    <th style={{ padding: '8px' }}>Product Name</th>
                                    <th style={{ padding: '8px', textAlign: 'right' }}>Current Level</th>
                                    <th style={{ padding: '8px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.low_stock_items.map((item, idx) => (
                                    <tr key={idx} style={{ background: '#fff0f0', borderBottom: '1px solid #fadbd8' }}>
                                        <td style={{ padding: '8px', fontWeight: 'bold', color: '#c0392b' }}>{item.name}</td>
                                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{item.initial_stock}</td>
                                        <td style={{ padding: '8px', color: '#c0392b', fontStyle: 'italic' }}>Below Threshold</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* FULL INVENTORY LIST */}
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '10px', color: '#2c3e50' }}>📦 Complete Inventory List</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                        <tr style={{ background: '#2c3e50', color: 'white', textAlign: 'left' }}>
                            <th style={{ padding: '6px' }}>Product Name</th>
                            <th style={{ padding: '6px' }}>SKU</th>
                            <th style={{ padding: '6px' }}>Location</th>
                            <th style={{ padding: '6px', textAlign: 'right' }}>Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stockList.map((item, idx) => (
                            <tr key={idx} style={{ background: idx % 2 === 0 ? '#f9f9f9' : 'white', borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '6px' }}>{item.product_name}</td>
                                <td style={{ padding: '6px', color: '#7f8c8d' }}>{item.sku}</td>
                                <td style={{ padding: '6px' }}>{item.location_name} ({item.location_code})</td>
                                <td style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>{Number(item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* FOOTER */}
                <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '10px', fontSize: '10px', color: '#999', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Odoo Hackathon v1.0</span>
                    <span>Page 1 of 1</span>
                </div>
            </div>
        </div>
    );
}

const Card = ({ title, value, color, details }) => {
    const [hover, setHover] = useState(false);
    return (
        <div style={{ flex: 1, minWidth: '250px', background: 'white', padding: '20px', borderRadius: '8px', borderLeft: `5px solid ${color}`, boxShadow: '0 2px 5px rgba(0,0,0,0.1)', position: 'relative', zIndex: hover ? 1000 : 1 }} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
            <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>{title}</h4><h2 style={{ margin: 0, fontSize: '2rem' }}>{value}</h2>
            {hover && details?.length > 0 && (
                <div style={{ position: 'absolute', top: '110%', left: 0, width: '100%', background: 'white', border: '1px solid #ccc', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px' }}>
                    <strong>⚠️ Needs Attention:</strong>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>{details.map((i,x)=><li key={x}>{i.name} ({i.initial_stock})</li>)}</ul>
                </div>
            )}
        </div>
    );
};

const ChartBox = ({ title, children }) => (
    <div style={{ flex: 1, minWidth: '300px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h3>{title}</h3>
        <ResponsiveContainer width="100%" height={300}>{children}</ResponsiveContainer>
    </div>
);

export default Dashboard;