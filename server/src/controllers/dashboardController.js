const db = require('../config/db');

exports.getKPIs = async (req, res) => {
  try {
    const { category, location, status } = req.query;

    // Build WHERE clauses based on filters
    let categoryFilter = '';
    let locationJoin = '';
    let statusHaving = '';

    if (category && category !== 'all') {
      categoryFilter = `WHERE p.category = ${db.escape(category)}`;
    }

    if (location && location !== 'all') {
      locationJoin = `AND s.location_id = ${db.escape(location)}`;
    }

    // Total Products
    let totalProductsQuery = `SELECT COUNT(*) as count FROM products p ${categoryFilter}`;
    const [totalProductsResult] = await db.query(totalProductsQuery);
    const totalProducts = totalProductsResult[0].count;

    // Low Stock
    const lowStockQuery = `
      SELECT COUNT(*) as count FROM (
        SELECT p.product_id 
        FROM products p 
        LEFT JOIN product_stock_levels s ON p.product_id = s.product_id ${locationJoin}
        ${categoryFilter}
        GROUP BY p.product_id, p.low_stock_threshold 
        HAVING COALESCE(SUM(s.quantity), 0) <= p.low_stock_threshold 
        AND COALESCE(SUM(s.quantity), 0) > 0
      ) as low_stock_items
    `;
    const [lowStockResult] = await db.query(lowStockQuery);
    const lowStock = lowStockResult[0].count;

    // Out of Stock
    const outOfStockQuery = `
      SELECT COUNT(*) as count FROM (
        SELECT p.product_id 
        FROM products p 
        LEFT JOIN product_stock_levels s ON p.product_id = s.product_id ${locationJoin}
        ${categoryFilter}
        GROUP BY p.product_id 
        HAVING COALESCE(SUM(s.quantity), 0) = 0
      ) as out_of_stock_items
    `;
    const [outOfStockResult] = await db.query(outOfStockQuery);
    const outOfStock = outOfStockResult[0].count;

    // Apply status filter to results
    let filteredTotalProducts = totalProducts;
    let filteredLowStock = lowStock;
    let filteredOutOfStock = outOfStock;

    if (status && status !== 'all') {
      if (status === 'in_stock') {
        filteredLowStock = 0;
        filteredOutOfStock = 0;
        filteredTotalProducts = Number(totalProducts) - Number(lowStock) - Number(outOfStock);
      } else if (status === 'low_stock') {
        filteredTotalProducts = lowStock;
        filteredOutOfStock = 0;
      } else if (status === 'out_of_stock') {
        filteredTotalProducts = outOfStock;
        filteredLowStock = 0;
      }
    }

    // Mock Pending Receipts/Deliveries
    const pendingReceipts = 5;
    const pendingDeliveries = 3;

    res.json({
      totalProducts: Number(filteredTotalProducts),
      lowStock: Number(filteredLowStock),
      outOfStock: Number(filteredOutOfStock),
      pendingReceipts,
      pendingDeliveries
    });
  } catch (err) {
    console.error('Dashboard KPI Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
