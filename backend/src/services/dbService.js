import { db } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

// Helper function to generate UUID
export const generateUUID = () => {
  return uuidv4();
};

// Helper function to execute queries
export const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Helper to get single row
export const queryOne = async (sql, params = []) => {
  const results = await query(sql, params);
  return results[0] || null;
};

// Helper to build WHERE clause for filters
export const buildWhereClause = (filters, tableAlias = 'o') => {
  const conditions = [];
  const params = [];

  if (filters.type) {
    conditions.push(`${tableAlias}.type = ?`);
    params.push(filters.type);
  }

  if (filters.status) {
    conditions.push(`${tableAlias}.status = ?`);
    params.push(filters.status);
  }

  if (filters.warehouse_id) {
    conditions.push(`(sl.warehouse_id = ? OR dl.warehouse_id = ?)`);
    params.push(filters.warehouse_id, filters.warehouse_id);
  }

  if (filters.product_id) {
    conditions.push(`oi.product_id = ?`);
    params.push(filters.product_id);
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  };
};


