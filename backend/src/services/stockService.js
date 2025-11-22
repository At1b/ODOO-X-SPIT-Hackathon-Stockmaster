import { db } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

export const stockService = {
  async getStockLevel(productId, locationId, connection = null) {
    const db = connection || pool;
    
    const [results] = await db.execute(
      'SELECT quantity FROM stock_levels WHERE product_id = ? AND location_id = ?',
      [productId, locationId]
    );

    return results[0]?.quantity || 0;
  },

  async updateStock(productId, locationId, quantity, operation = 'add', connection = null) {
    const db = connection || pool;
    const useTransaction = !!connection;
    let shouldCommit = false;

    try {
      if (!useTransaction) {
        await db.beginTransaction();
        shouldCommit = true;
      }

      // Get current stock
      const currentStock = await this.getStockLevel(productId, locationId, db);

      let newQuantity;
      if (operation === 'add') {
        newQuantity = currentStock + quantity;
      } else if (operation === 'subtract') {
        newQuantity = Math.max(0, currentStock - quantity);
      } else {
        throw new AppError('Invalid operation. Use "add" or "subtract"', 400);
      }

      // Upsert stock level
      await db.execute(
        `INSERT INTO stock_levels (id, product_id, location_id, quantity)
         VALUES (UUID(), ?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = ?`,
        [productId, locationId, newQuantity, newQuantity]
      );

      // Update total_stock in products table
      await this.updateProductTotalStock(productId, db);

      if (shouldCommit) {
        await db.commit();
      }

      return { product_id: productId, location_id: locationId, quantity: newQuantity };
    } catch (error) {
      if (shouldCommit) {
        await db.rollback();
      }
      throw new AppError('Failed to update stock: ' + error.message, 500);
    }
  },

  async updateProductTotalStock(productId, connection = null) {
    const db = connection || pool;

    // Calculate total stock across all locations
    const [results] = await db.execute(
      'SELECT SUM(quantity) as total FROM stock_levels WHERE product_id = ?',
      [productId]
    );

    const totalStock = results[0]?.total || 0;

    // Update product
    await db.execute(
      'UPDATE products SET total_stock = ? WHERE id = ?',
      [totalStock, productId]
    );

    return totalStock;
  }
};
