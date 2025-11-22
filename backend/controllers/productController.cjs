const pool = require('../config/database.cjs');
const Joi = require('joi');
const { generateSKU } = require('../utils/skuGenerator.cjs');
const { generateBarcode } = require('../utils/barcodeGenerator.cjs');

const productSchema = Joi.object({
  name: Joi.string().required().max(255),
  category: Joi.string().required().max(255),
  uom: Joi.string().required().max(50),
  low_stock_threshold: Joi.number().integer().min(0).default(0),
  initial_stock: Joi.number().integer().min(0).default(0),
});

// GET /products
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, location } = req.query || {};

    // If a specific location is requested, compute total_stock for that location only.
    // Otherwise compute overall stock across all locations.
    const totalStockExpr = location
      ? 'COALESCE(SUM(CASE WHEN psl.location_id = ? THEN psl.quantity ELSE 0 END),0) AS total_stock'
      : 'COALESCE(SUM(psl.quantity),0) AS total_stock';

    let query = `SELECT p.*, ${totalStockExpr}
      FROM products p
      LEFT JOIN product_stock_levels psl ON p.product_id = psl.product_id`;

    const params = [];
    if (location) params.push(location);

    const whereClauses = [];
    if (search) {
      whereClauses.push('(p.name LIKE ? OR p.sku LIKE ? OR p.category LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category) {
      // use a tolerant LIKE match so UI selections match DB values even with minor differences
      whereClauses.push('p.category LIKE ?');
      params.push(`%${String(category).trim()}%`);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' GROUP BY p.product_id ORDER BY p.created_at DESC';

    const [rows] = await pool.query(query, params);

    // add low_stock boolean
    const data = rows.map((r) => ({
      ...r,
      low_stock: r.total_stock < (r.low_stock_threshold || 0),
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
};

// GET /products/:id
exports.getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, COALESCE(SUM(psl.quantity),0) AS total_stock
       FROM products p
       LEFT JOIN product_stock_levels psl ON p.product_id = psl.product_id
       WHERE p.product_id = ?
       GROUP BY p.product_id`,
      [req.params.id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const product = rows[0];
    product.low_stock = product.total_stock < (product.low_stock_threshold || 0);

    // Generate barcode on-demand from SKU so the frontend can re-fetch it after refresh
    try {
      const barcode = await generateBarcode(product.sku);
      product.barcode = barcode;
    } catch (err) {
      console.error('Failed to generate barcode for product', product.product_id, err);
      product.barcode = null;
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
};

// POST /products
exports.createProduct = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }

    await connection.beginTransaction();

    // Generate SKU and barcode
    const sku = generateSKU(value.category, value.name);
    const barcode = await generateBarcode(sku);

    const [result] = await connection.query(
      `INSERT INTO products (name, sku, category, uom, low_stock_threshold, initial_stock, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [value.name, sku, value.category, value.uom, value.low_stock_threshold, value.initial_stock]
    );

    const productId = result.insertId;

    // Ensure default location exists: Main Warehouse
    const [locs] = await connection.query('SELECT * FROM locations WHERE name = ?', ['Main Warehouse']);
    let locationId;
    if (locs.length > 0) {
      locationId = locs[0].location_id;
    } else {
      const [locRes] = await connection.query(
        'INSERT INTO locations (name, code, parent_id, created_at) VALUES (?, ?, NULL, NOW())',
        ['Main Warehouse', 'MAIN']
      );
      locationId = locRes.insertId;
    }

    // Insert initial stock into product_stock_levels
    if (value.initial_stock && value.initial_stock > 0) {
      await connection.query(
        'INSERT INTO product_stock_levels (product_id, location_id, quantity, last_updated) VALUES (?, ?, ?, NOW())',
        [productId, locationId, value.initial_stock]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      data: { product_id: productId, sku, barcode },
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create product' });
  } finally {
    connection.release();
  }
};

// PUT /products/:id
exports.updateProduct = async (req, res) => {
  try {
    const { name, category, uom, low_stock_threshold } = req.body;

    await pool.query(
      `UPDATE products SET name = ?, category = ?, uom = ?, low_stock_threshold = ? WHERE product_id = ?`,
      [name, category, uom, low_stock_threshold, req.params.id]
    );

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to update product' });
  }
};

// DELETE /products/:id
exports.deleteProduct = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query('DELETE FROM product_stock_levels WHERE product_id = ?', [req.params.id]);
    await connection.query('DELETE FROM products WHERE product_id = ?', [req.params.id]);

    await connection.commit();

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to delete product' });
  } finally {
    connection.release();
  }
};

// GET /products/:id/stock
exports.getProductStock = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT psl.id, psl.location_id, l.name as location_name, psl.quantity, psl.last_updated
       FROM product_stock_levels psl
       LEFT JOIN locations l ON l.location_id = psl.location_id
       WHERE psl.product_id = ?`,
      [req.params.id]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch stock' });
  }
};

// GET /products/categories/list -> returns distinct categories
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT category FROM products');
    res.json({ success: true, data: rows.map((r) => r.category) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
};

// POST /products/generate-sku
exports.generateSKU = async (req, res) => {
  try {
    const { name, category } = req.body || {};
    if (!name || !category) {
      return res.status(400).json({ success: false, error: 'name and category are required' });
    }

    // helper: keep only alphanumeric, uppercase, take first 3 chars
    const fmt = (s) => {
      if (!s) return '';
      const cleaned = String(s).replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      return (cleaned + 'XXX').substr(0, 3);
    };

    const catPart = fmt(category);
    const namePart = fmt(name);
    const prefix = `${catPart}-${namePart}`; // e.g. CAT-NAM

    // find last SKU with this prefix -- rely on zero-padded 4-digit suffix for lexicographic order
    const like = `${prefix}-%`;
    const [rows] = await pool.query('SELECT sku FROM products WHERE sku LIKE ? ORDER BY sku DESC LIMIT 1', [like]);

    let seq = 1;
    if (rows && rows.length > 0 && rows[0].sku) {
      const m = String(rows[0].sku).match(/-(\d{1,})$/);
      if (m && m[1]) {
        const last = parseInt(m[1], 10);
        if (!isNaN(last)) seq = last + 1;
      }
    }

    const seqStr = String(seq).padStart(4, '0');
    const sku = `${prefix}-${seqStr}`;

    // try to generate barcode (may fail but still return SKU)
    let barcode = null;
    try {
      barcode = await generateBarcode(sku);
    } catch (err) {
      console.error('generateSKU: barcode generation failed', err);
      barcode = null;
    }

    res.json({ success: true, data: { sku, barcode } });
  } catch (error) {
    console.error('generateSKU error', error);
    res.status(500).json({ success: false, error: 'Failed to generate SKU' });
  }
};

// Backwards-compatible handler used previously
exports.getProductLocations = exports.getProductStock;
