const pool = require('../config/database');

exports.getStats = async (req, res) => {
  try {
    // Total products
    const [productsCount] = await pool.query(
      'SELECT COUNT(*) as total FROM products'
    );

    // Low stock products
    const [lowStockCount] = await pool.query(
      `SELECT COUNT(DISTINCT p.product_id) as total
       FROM products p
       LEFT JOIN product_stock_levels psl ON p.product_id = psl.product_id
       GROUP BY p.product_id
       HAVING COALESCE(SUM(psl.quantity), 0) < p.low_stock_threshold`
    );

    // Total categories
    const [categoriesCount] = await pool.query(
      'SELECT COUNT(DISTINCT category) as total FROM products'
    );

    // Total stock across all locations
    const [totalStock] = await pool.query(
      'SELECT COALESCE(SUM(quantity), 0) as total FROM product_stock_levels'
    );

    // Stock by category
    const [stockByCategory] = await pool.query(
      `SELECT p.category, COALESCE(SUM(psl.quantity), 0) as total_stock
       FROM products p
       LEFT JOIN product_stock_levels psl ON p.product_id = psl.product_id
       GROUP BY p.category
       ORDER BY total_stock DESC
       LIMIT 10`
    );

    // Stock by location
    const [stockByLocation] = await pool.query(
      `SELECT l.name, COALESCE(SUM(psl.quantity), 0) as total_stock
       FROM locations l
       LEFT JOIN product_stock_levels psl ON l.location_id = psl.location_id
       GROUP BY l.location_id, l.name
       ORDER BY total_stock DESC
       LIMIT 10`
    );

    // Recently added products
    const [recentProducts] = await pool.query(
      `SELECT p.product_id, p.name, p.sku, p.category, COALESCE(SUM(psl.quantity), 0) as total_stock
       FROM products p
       LEFT JOIN product_stock_levels psl ON p.product_id = psl.product_id
       GROUP BY p.product_id
       ORDER BY p.created_at DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        total_products: productsCount[0].total,
        low_stock_count: lowStockCount[0]?.total || 0,
        total_categories: categoriesCount[0].total,
        total_stock: totalStock[0].total,
        stock_by_category: stockByCategory,
        stock_by_location: stockByLocation,
        recent_products: recentProducts,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats',
    });
  }
};
