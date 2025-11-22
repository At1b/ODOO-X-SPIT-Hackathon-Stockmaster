const pool = require('../config/database.cjs');

exports.getStats = async (req, res) => {
  try {
    const [[{ total_products }]] = await pool.query('SELECT COUNT(*) as total_products FROM products');
    const [[{ total_stock }]] = await pool.query('SELECT COALESCE(SUM(quantity),0) as total_stock FROM product_stock_levels');
    const [lowRows] = await pool.query(
      `SELECT p.product_id, p.name, COALESCE(SUM(psl.quantity),0) as total_stock, p.low_stock_threshold
       FROM products p
       LEFT JOIN product_stock_levels psl ON p.product_id = psl.product_id
       GROUP BY p.product_id
       HAVING total_stock < p.low_stock_threshold`
    );

    const [byLocation] = await pool.query(
      `SELECT l.location_id, l.name, COALESCE(SUM(psl.quantity),0) as total_stock
       FROM locations l
       LEFT JOIN product_stock_levels psl ON l.location_id = psl.location_id
       GROUP BY l.location_id`);

    // stock by category
    const [stockByCategory] = await pool.query(
      `SELECT p.category as category, COALESCE(SUM(psl.quantity),0) as total_stock
       FROM products p
       LEFT JOIN product_stock_levels psl ON p.product_id = psl.product_id
       GROUP BY p.category
       ORDER BY total_stock DESC`
    );

    // recent products (latest 5)
    const [recentProducts] = await pool.query(
      `SELECT p.product_id, p.name, p.sku, p.category, COALESCE(SUM(psl.quantity),0) as total_stock
       FROM products p
       LEFT JOIN product_stock_levels psl ON p.product_id = psl.product_id
       GROUP BY p.product_id
       ORDER BY p.created_at DESC
       LIMIT 5`
    );

    const [[{ total_categories }]] = await pool.query('SELECT COUNT(DISTINCT category) as total_categories FROM products');

    res.json({
      success: true,
      data: {
        total_products: total_products || 0,
        total_stock: total_stock || 0,
        low_stock_count: lowRows.length,
        stock_by_location: byLocation,
        stock_by_category: stockByCategory,
        recent_products: recentProducts,
        total_categories: total_categories || 0,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
};
