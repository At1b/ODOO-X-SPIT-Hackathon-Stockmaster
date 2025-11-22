import express from "express";
import pool from "../config/db.js";


const router = express.Router();

// =============================
// GET ALL RECEIPTS
// =============================
router.get("/receipts", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM receipts ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching receipts:", err);
    res.status(500).json({ error: "Failed to fetch receipts" });
  }
});

// =============================
// GET RECEIPT BY ID WITH ITEMS
// =============================
router.get("/receipts/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [receipt] = await pool.query("SELECT * FROM receipts WHERE receipt_id = ?", [id]);
    const [items] = await pool.query("SELECT * FROM receipt_items WHERE receipt_id = ?", [id]);

    res.json({ receipt: receipt[0], items });
  } catch (err) {
    console.error("Error fetching receipt:", err);
    res.status(500).json({ error: "Failed to fetch receipt details" });
  }
});

// =============================
// GET ALL DELIVERIES
// =============================
router.get("/deliveries", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM deliveries ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching deliveries:", err);
    res.status(500).json({ error: "Failed to fetch deliveries" });
  }
});

// =============================
// GET ALL TRANSFERS
// =============================
router.get("/transfers", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM transfers ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching transfers:", err);
    res.status(500).json({ error: "Failed to fetch transfers" });
  }
});

export default router;
