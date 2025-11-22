const pool = require('../config/database');
const Joi = require('joi');
const { generateSKU } = require('../utils/skuGenerator');
const { generateBarcode } = require('../utils/barcodeGenerator');

// Validation schema
const productSchema = Joi.object({
  name: Joi.string().required().max(255),
  category_id: Joi.number().integer().required(),
  unit: Joi.string().required().max(50),
  initial_stock: Joi.number().integer().min(0).default(0),
  reorder_min: Joi.number().integer().min(0).default(0),
  reorder_quantity: Joi.number().integer().min(0).default(0),
  reorder_enabled: Joi.boolean().default(true),
  locations: Joi.array().items(
    Joi.object({
      location_id: Joi.string().required(),
      quantity: Joi.number().integer().min(0).required(),
    })
  ),
});

exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, location, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name,
        COALESCE(SUM(pl.quantity), 0) as total_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_locations pl ON p.id = pl.product_id
    `;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(p.name LIKE ? OR p.sku LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      conditions.push('p.category_id = ?');
      params.push(category);
    }

    if (location) {
      conditions.push('pl.location_id = ?');
      params.push(location);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY p.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [products] = await pool.query(query, params);

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const [products] = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: products[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
    });
  }
};

exports.createProduct = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // Validate input
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    await connection.beginTransaction();

    // Get category name for SKU generation
    const [categories] = await connection.query(
      'SELECT name FROM categories WHERE id = ?',
      [value.category_id]
    );

    if (categories.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
      });
    }

    // Count existing products in category
    const [countResult] = await connection.query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [value.category_id]
    );

    // Generate SKU and barcode
    const sku = generateSKU(categories[0].name, countResult[0].count);
    const barcodeData = await generateBarcode(sku);

    // Insert product
    const [productResult] = await connection.query(
      `INSERT INTO products (name, sku, unit, category_id, barcode_data, low_stock)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [value.name, sku, value.unit, value.category_id, barcodeData, value.reorder_min]
    );

    const productId = productResult.insertId;

    // Insert reordering rules
    await connection.query(
      `INSERT INTO reordering_rules (product_id, min_quantity, reorder_quantity, enabled)
       VALUES (?, ?, ?, ?)`,
      [productId, value.reorder_min, value.reorder_quantity, value.reorder_enabled]
    );

    // Insert locations and stock
    if (value.locations && value.locations.length > 0) {
      for (const location of value.locations) {
        if (location.quantity > 0) {
          // Insert location
          await connection.query(
            `INSERT INTO product_locations (product_id, location_id, quantity)
             VALUES (?, ?, ?)`,
            [productId, location.location_id, location.quantity]
          );

          // Record stock movement
          await connection.query(
            `INSERT INTO stock_movements (product_id, location_id, quantity, movement_type, notes)
             VALUES (?, ?, ?, 'adjustment', 'Initial stock')`,
            [productId, location.location_id, location.quantity]
          );
        }
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      data: {
        id: productId,
        sku,
        barcode_data: barcodeData,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
    });
  } finally {
    connection.release();
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, category_id, unit, reorder_min, reorder_quantity } = req.body;

    await pool.query(
      `UPDATE products SET name = ?, category_id = ?, unit = ?, low_stock = ?
       WHERE id = ?`,
      [name, category_id, unit, reorder_min, req.params.id]
    );

    await pool.query(
      `UPDATE reordering_rules SET min_quantity = ?, reorder_quantity = ?
       WHERE product_id = ?`,
      [reorder_min, reorder_quantity, req.params.id]
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
    });
  }
};

exports.getProductStock = async (req, res) => {
  try {
    const [stock] = await pool.query(
      `SELECT location_id, quantity
       FROM product_locations
       WHERE product_id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: stock,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock',
    });
  }
};

exports.generateProductSKU = async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT category_id FROM products WHERE id = ?',
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    const [categories] = await pool.query(
      'SELECT name FROM categories WHERE id = ?',
      [products[0].category_id]
    );

    const [countResult] = await pool.query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [products[0].category_id]
    );

    const newSKU = generateSKU(categories[0].name, countResult[0].count);
    const barcodeData = await generateBarcode(newSKU);

    await pool.query(
      'UPDATE products SET sku = ?, barcode_data = ? WHERE id = ?',
      [newSKU, barcodeData, req.params.id]
    );

    res.json({
      success: true,
      data: {
        sku: newSKU,
        barcode_data: barcodeData,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate SKU',
    });
  }
};
