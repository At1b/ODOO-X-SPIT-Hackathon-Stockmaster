const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get('/', (req, res) => {
    return res.json("From Backend Side");
});

// --- HAMZA'S MODULE: AUDIT & LEDGER ---

// 1. GET THE FULL LEDGER (History)
app.get('/ledger', async (req, res) => {
    try {
        const sql = `
            SELECT 
                l.ledger_id, 
                l.movement_type, 
                p.name as product_name, 
                loc.code as location_code, 
                l.qty_change, 
                l.created_at 
            FROM stock_ledger l
            JOIN products p ON l.product_id = p.product_id
            JOIN locations loc ON l.location_id = loc.location_id
            ORDER BY l.created_at DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. CREATE A STOCK ADJUSTMENT (The "Fix It" Button)
app.post('/adjustments', async (req, res) => {
    const { product_id, location_id, counted_qty, user_id, reason } = req.body;

    try {
        // Step A: Find out what the system *thinks* we have
        const [stockRows] = await db.query(
            'SELECT quantity FROM product_stock_levels WHERE product_id = ? AND location_id = ?', 
            [product_id, location_id]
        );

        const currentQty = stockRows.length > 0 ? parseFloat(stockRows[0].quantity) : 0;
        const difference = parseFloat(counted_qty) - currentQty;

        if (difference === 0) {
            return res.json({ message: "No change needed. Count matches system." });
        }

        // Step B: Update the "Current Stock" table
        // We use ON DUPLICATE KEY UPDATE in case the row didn't exist yet (found new item)
        await db.query(`
            INSERT INTO product_stock_levels (product_id, location_id, quantity) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE quantity = ?`, 
            [product_id, location_id, counted_qty, counted_qty]
        );

        // Step C: Log the Adjustment details
        const [adjResult] = await db.query(`
            INSERT INTO stock_adjustments (product_id, location_id, counted_qty, previous_qty, reason, created_by)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [product_id, location_id, counted_qty, currentQty, reason, user_id]
        );

        // Step D: Write to the "Stock Ledger" (The Permanent History)
        await db.query(`
            INSERT INTO stock_ledger (movement_type, product_id, location_id, qty_change, reference_id)
            VALUES ('adjustment', ?, ?, ?, ?)`,
            [product_id, location_id, difference, adjResult.insertId]
        );

        res.json({ message: "Stock Adjusted Successfully", difference: difference });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 3. GET CURRENT STOCK SNAPSHOT (To see what IDs to use)
app.get('/stock', async (req, res) => {
    try {
        const sql = `
            SELECT 
                s.product_id,
                p.name AS product_name,
                p.sku,
                s.location_id,
                l.name AS location_name,
                l.code AS location_code,
                s.quantity
            FROM product_stock_levels s
            JOIN products p ON s.product_id = p.product_id
            JOIN locations l ON s.location_id = l.location_id
            ORDER BY p.name ASC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});