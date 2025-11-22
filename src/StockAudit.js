import React, { useState, useEffect } from 'react';

function StockAudit() {
    const [ledger, setLedger] = useState([]);
    const [stockList, setStockList] = useState([]); // <--- NEW STATE
    
    // Form State
    const [adjForm, setAdjForm] = useState({
        product_id: '',
        location_id: '',
        counted_qty: '',
        reason: 'Regular Audit'
    });

    // Load Data
    useEffect(() => {
        fetchLedger();
        fetchStock(); // <--- NEW FETCH
    }, []);

    const fetchLedger = () => {
        fetch('http://localhost:8081/ledger')
            .then(res => res.json())
            .then(data => setLedger(data))
            .catch(err => console.error("Error fetching ledger:", err));
    };

    const fetchStock = () => {
        fetch('http://localhost:8081/stock')
            .then(res => res.json())
            .then(data => setStockList(data))
            .catch(err => console.error("Error fetching stock:", err));
    };

    // Handle Adjustment
    const handleAdjustment = async (e) => {
        e.preventDefault();
        
        const payload = { ...adjForm, user_id: 1 }; 

        try {
            const res = await fetch('http://localhost:8081/adjustments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            alert(data.message);
            
            // Refresh BOTH tables to show new reality
            fetchLedger(); 
            fetchStock(); 
            
            // Clear form
            setAdjForm({ ...adjForm, counted_qty: '' }); 
        } catch (err) {
            alert("Adjustment failed");
        }
    };

    // Helper to fill form when clicking a row
    const fillForm = (item) => {
        setAdjForm({
            ...adjForm,
            product_id: item.product_id,
            location_id: item.location_id,
            counted_qty: item.quantity // Pre-fill with current system qty
        });
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Audit & Ledger</h1>

            <div style={{ display: 'flex', gap: '20px' }}>
                
                {/* --- LEFT: CURRENT INVENTORY (Click to Select) --- */}
                <div style={{ flex: 1 }}>
                    <h3>Current Stock (Click to Fix)</h3>
                    <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', cursor: 'pointer' }}>
                        <thead style={{ background: '#eee' }}>
                            <tr>
                                <th>ID</th>
                                <th>Product</th>
                                <th>Loc ID</th>
                                <th>Location</th>
                                <th>Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockList.map((item) => (
                                <tr key={`${item.product_id}-${item.location_id}`} onClick={() => fillForm(item)} title="Click to adjust this item">
                                    <td>{item.product_id}</td>
                                    <td>{item.product_name} <small>({item.sku})</small></td>
                                    <td>{item.location_id}</td>
                                    <td>{item.location_name} <small>({item.location_code})</small></td>
                                    <td style={{ fontWeight: 'bold' }}>{item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- RIGHT: ADJUSTMENT FORM --- */}
                <div style={{ flex: 1, background: '#f9f9f9', padding: '20px', border: '1px solid #ddd' }}>
                    <h3>Make Adjustment</h3>
                    <form onSubmit={handleAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                            <label>Product ID:</label>
                            <input 
                                style={{ width: '100%', padding: '5px' }}
                                value={adjForm.product_id}
                                onChange={e => setAdjForm({...adjForm, product_id: e.target.value})}
                                readOnly // Make it read-only if you want to force selection
                            />
                        </div>
                        <div>
                            <label>Location ID:</label>
                            <input 
                                style={{ width: '100%', padding: '5px' }}
                                value={adjForm.location_id}
                                onChange={e => setAdjForm({...adjForm, location_id: e.target.value})}
                                readOnly 
                            />
                        </div>
                        <div>
                            <label>Actual Count (Physical):</label>
                            <input 
                                style={{ width: '100%', padding: '5px', border: '2px solid blue' }}
                                type="number"
                                value={adjForm.counted_qty}
                                onChange={e => setAdjForm({...adjForm, counted_qty: e.target.value})}
                                placeholder="Enter real number..."
                            />
                        </div>
                        <div>
                            <label>Reason Code:</label>
                            <select 
                                style={{ width: '100%', padding: '5px' }}
                                value={adjForm.reason}
                                onChange={e => setAdjForm({...adjForm, reason: e.target.value})}
                            >
                                <option value="Regular Audit">Regular Audit</option>
                                <option value="Damaged / Broken">Damaged / Broken</option>
                                <option value="Stolen / Theft">Stolen / Theft</option>
                                <option value="Data Entry Error">Data Entry Error</option>
                                <option value="Expired Goods">Expired Goods</option>
                            </select>
                        </div>
                        <button type="submit" style={{ padding: '10px', background: 'black', color: 'white', cursor: 'pointer' }}>
                            Update Stock
                        </button>
                    </form>
                </div>
            </div>

            {/* --- BOTTOM: HISTORY (SCROLLABLE) --- */}
            <hr style={{ margin: '30px 0' }} />
            <h3>History Log (Scroll for more)</h3>
            
            {/* 1. The Scrollable Container Wrapper */}
            <div style={{ 
                maxHeight: '400px',       // Limits height to approx 10 rows
                overflowY: 'auto',        // Adds the scrollbar
                border: '1px solid #ccc', // Optional border
                boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)' // Inner shadow for depth
            }}>
                <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                    
                    {/* 2. Sticky Header (Stays on top while scrolling) */}
                    <thead style={{ 
                        position: 'sticky', 
                        top: 0, 
                        background: '#333', 
                        color: 'white',
                        zIndex: 1 
                    }}>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Product</th>
                            <th>Location</th>
                            <th>Change</th>
                        </tr>
                    </thead>
                    
                    <tbody>
                        {ledger.map((row) => (
                            <tr key={row.ledger_id} style={{ background: 'white' }}>
                                <td>{new Date(row.created_at).toLocaleString()}</td>
                                <td style={{ 
                                    color: row.qty_change > 0 ? 'green' : 'red', 
                                    fontWeight: 'bold' 
                                }}>
                                    {row.movement_type.toUpperCase()}
                                </td>
                                <td>{row.product_name}</td>
                                <td>{row.location_code}</td>
                                <td>{row.qty_change > 0 ? `+${row.qty_change}` : row.qty_change}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default StockAudit;