const pool = require('../config/database');

exports.getDashboardStats = async (req, res) => {
  try {
    // Total products
    const [totalProducts] = await pool.query(
      'SELECT COUNT(*) as count FROM products'
    );

    // Low stock count
    const [lowStock] = await pool.query(`
      SELECT COUNT(DISTINCT p.id) as count
      FROM products p
      LEFT JOIN product_locations pl ON p.id = pl.product_id
      LEFT JOIN reordering_rules rr ON p.id = rr.product_id
      WHERE COALESCE(pl.quantity, 0) < COALESCE(rr.min_quantity, p.low_stock, 10)
    `);

    // Total categories
    const [totalCategories] = await pool.query(
      'SELECT COUNT(*) as count FROM categories'
    );

    // Total stock across all locations
    const [totalStock] = await pool.query(
      'SELECT COALESCE(SUM(quantity), 0) as total FROM product_locations'
    );

    res.json({
      success: true,
      data: {
        totalProducts: totalProducts[0].count,
        lowStockCount: lowStock[0].count,
        categoriesCount: totalCategories[0].count,
        totalStock: totalStock[0].total,
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
