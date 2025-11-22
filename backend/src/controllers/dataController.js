import pool from "../config/db.js";

//
// ===============================
// GET PRODUCTS
// ===============================
//
export const getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        product_id AS id,
        name,
        sku,
        category,
        uom,
        low_stock_threshold,
        initial_stock,
        created_at
      FROM products
    `);

    res.json({ success: true, data: rows });

  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

//
// ===============================
// GET WAREHOUSES (You DO NOT HAVE THIS TABLE)
// ===============================
//
export const getWarehouses = async (req, res) => {
  try {
    // Return an empty safe list
    res.json({ success: true, data: [] });
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

//
// ===============================
// GET LOCATIONS
// ===============================
//
export const getLocations = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        location_id AS id,
        name,
        code,
        parent_id,
        created_at
      FROM locations
    `);

    res.json({ success: true, data: rows });

  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
