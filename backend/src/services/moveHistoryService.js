import { db } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';

export const moveHistoryService = {
  async logMove(moveData, connection = null) {
    const db = connection || pool;

    try {
      const [result] = await db.execute(
        `INSERT INTO move_history (id, product_id, operation_id, from_location, to_location, quantity)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          moveData.product_id,
          moveData.operation_id,
          moveData.from_location || null,
          moveData.to_location || null,
          moveData.quantity
        ]
      );

      return { id: result.insertId, ...moveData };
    } catch (error) {
      throw new AppError('Failed to log move history: ' + error.message, 500);
    }
  },

  async getMoveHistory(filters = {}) {
    try {
      let sql = `
        SELECT 
          mh.*,
          p.name as product_name,
          p.sku,
          fl.name as from_location_name,
          tl.name as to_location_name,
          o.type as operation_type,
          o.status as operation_status
        FROM move_history mh
        JOIN products p ON mh.product_id = p.id
        LEFT JOIN locations fl ON mh.from_location = fl.id
        LEFT JOIN locations tl ON mh.to_location = tl.id
        LEFT JOIN operations o ON mh.operation_id = o.id
      `;

      const params = [];
      const conditions = [];

      if (filters.product_id) {
        conditions.push('mh.product_id = ?');
        params.push(filters.product_id);
      }

      if (filters.operation_id) {
        conditions.push('mh.operation_id = ?');
        params.push(filters.operation_id);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' ORDER BY mh.timestamp DESC';

      const [results] = await pool.execute(sql, params);

      return results.map(row => ({
        id: row.id,
        product_id: row.product_id,
        operation_id: row.operation_id,
        from_location: row.from_location,
        to_location: row.to_location,
        quantity: row.quantity,
        timestamp: row.timestamp,
        products: {
          id: row.product_id,
          name: row.product_name,
          sku: row.sku
        },
        from_location_name: row.from_location_name,
        to_location_name: row.to_location_name,
        operations: {
          id: row.operation_id,
          type: row.operation_type,
          status: row.operation_status
        }
      }));
    } catch (error) {
      throw new AppError('Failed to fetch move history: ' + error.message, 500);
    }
  }
};
