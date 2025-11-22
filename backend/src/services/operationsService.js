import { db } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { stockService } from './stockService.js';
import { moveHistoryService } from './moveHistoryService.js';
import { v4 as uuidv4 } from 'uuid';

export const createOperation = async (operationData, io) => {
  const { items, ...operationFields } = operationData;
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Generate UUID for operation
    const operationId = uuidv4();
    
    // Create operation
    const [operationResult] = await connection.execute(
      `INSERT INTO operations (id, type, status, source_location_id, destination_location_id, supplier, customer, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        operationId,
        operationFields.type,
        operationFields.status || 'draft',
        operationFields.source_location_id || null,
        operationFields.destination_location_id || null,
        operationFields.supplier || null,
        operationFields.customer || null,
        operationFields.created_by
      ]
    );

    // Create operation items
    if (items && items.length > 0) {
      const itemValues = items.map(item => [
        uuidv4(),
        operationId,
        item.product_id,
        item.quantity
      ]);

      const placeholders = items.map(() => '(?, ?, ?, ?)').join(', ');
      const flatValues = itemValues.flat();

      await connection.execute(
        `INSERT INTO operation_items (id, operation_id, product_id, quantity)
         VALUES ${placeholders}`,
        flatValues
      );
    }

    await connection.commit();

    // Fetch complete operation with items
    const completeOperation = await getOperationDetails(operationId);

    // Emit real-time event
    if (io) {
      io.emit('operation:created', completeOperation);
    }

    return completeOperation;
  } catch (error) {
    await connection.rollback();
    throw new AppError('Failed to create operation: ' + error.message, 500);
  } finally {
    connection.release();
  }
};

export const getOperationsList = async (filters = {}) => {
  try {
    let sql = `
      SELECT 
        o.*,
        sl.name as source_location_name,
        sl.warehouse_id as source_warehouse_id,
        sw.name as source_warehouse_name,
        dl.name as destination_location_name,
        dl.warehouse_id as destination_warehouse_id,
        dw.name as destination_warehouse_name
      FROM operations o
      LEFT JOIN locations sl ON o.source_location_id = sl.id
      LEFT JOIN warehouses sw ON sl.warehouse_id = sw.id
      LEFT JOIN locations dl ON o.destination_location_id = dl.id
      LEFT JOIN warehouses dw ON dl.warehouse_id = dw.id
      LEFT JOIN operation_items oi ON o.id = oi.operation_id
    `;

    const params = [];
    const conditions = [];

    if (filters.type) {
      conditions.push('o.type = ?');
      params.push(filters.type);
    }

    if (filters.status) {
      conditions.push('o.status = ?');
      params.push(filters.status);
    }

    if (filters.warehouse_id) {
      conditions.push('(sl.warehouse_id = ? OR dl.warehouse_id = ?)');
      params.push(filters.warehouse_id, filters.warehouse_id);
    }

    if (filters.product_id) {
      conditions.push('oi.product_id = ?');
      params.push(filters.product_id);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' GROUP BY o.id ORDER BY o.created_at DESC';

    const [operations] = await pool.execute(sql, params);

    // Fetch items for each operation
    for (const operation of operations) {
      const [items] = await pool.execute(
        `SELECT oi.*, p.name as product_name, p.sku, p.category, p.uom
         FROM operation_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.operation_id = ?`,
        [operation.id]
      );

      operation.operation_items = items.map(item => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        products: {
          id: item.product_id,
          name: item.product_name,
          sku: item.sku,
          category: item.category,
          uom: item.uom
        }
      }));

      // Format location data
      if (operation.source_location_id) {
        operation.source_location = {
          id: operation.source_location_id,
          name: operation.source_location_name,
          warehouse_id: operation.source_warehouse_id,
          warehouses: operation.source_warehouse_id ? {
            id: operation.source_warehouse_id,
            name: operation.source_warehouse_name
          } : null
        };
      }

      if (operation.destination_location_id) {
        operation.destination_location = {
          id: operation.destination_location_id,
          name: operation.destination_location_name,
          warehouse_id: operation.destination_warehouse_id,
          warehouses: operation.destination_warehouse_id ? {
            id: operation.destination_warehouse_id,
            name: operation.destination_warehouse_name
          } : null
        };
      }
    }

    return operations;
  } catch (error) {
    throw new AppError('Failed to fetch operations: ' + error.message, 500);
  }
};

export const getOperationDetails = async (operationId) => {
  try {
    const [operations] = await pool.execute(
      `SELECT 
        o.*,
        sl.name as source_location_name,
        sl.warehouse_id as source_warehouse_id,
        sw.name as source_warehouse_name,
        dl.name as destination_location_name,
        dl.warehouse_id as destination_warehouse_id,
        dw.name as destination_warehouse_name
      FROM operations o
      LEFT JOIN locations sl ON o.source_location_id = sl.id
      LEFT JOIN warehouses sw ON sl.warehouse_id = sw.id
      LEFT JOIN locations dl ON o.destination_location_id = dl.id
      LEFT JOIN warehouses dw ON dl.warehouse_id = dw.id
      WHERE o.id = ?`,
      [operationId]
    );

    if (operations.length === 0) {
      return null;
    }

    const operation = operations[0];

    // Fetch items
    const [items] = await pool.execute(
      `SELECT oi.*, p.name as product_name, p.sku, p.category, p.uom
       FROM operation_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.operation_id = ?`,
      [operationId]
    );

    operation.operation_items = items.map(item => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      products: {
        id: item.product_id,
        name: item.product_name,
        sku: item.sku,
        category: item.category,
        uom: item.uom
      }
    }));

    // Format location data
    if (operation.source_location_id) {
      operation.source_location = {
        id: operation.source_location_id,
        name: operation.source_location_name,
        warehouse_id: operation.source_warehouse_id,
        warehouses: operation.source_warehouse_id ? {
          id: operation.source_warehouse_id,
          name: operation.source_warehouse_name
        } : null
      };
    }

    if (operation.destination_location_id) {
      operation.destination_location = {
        id: operation.destination_location_id,
        name: operation.destination_location_name,
        warehouse_id: operation.destination_warehouse_id,
        warehouses: operation.destination_warehouse_id ? {
          id: operation.destination_warehouse_id,
          name: operation.destination_warehouse_name
        } : null
      };
    }

    return operation;
  } catch (error) {
    throw new AppError('Failed to fetch operation: ' + error.message, 500);
  }
};

export const validateOperationService = async (operationId, io) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Get operation with items
    const operation = await getOperationDetails(operationId);

    if (!operation) {
      throw new AppError('Operation not found', 404);
    }

    if (operation.status === 'done') {
      throw new AppError('Operation already validated', 400);
    }

    // Check stock availability for delivery and transfer
    if (operation.type === 'delivery' || operation.type === 'transfer') {
      for (const item of operation.operation_items) {
        const availableStock = await stockService.getStockLevel(
          item.product_id,
          operation.source_location_id
        );

        if (availableStock < item.quantity) {
          const productName = item.products?.name || 'Unknown';
          throw new AppError(
            `Insufficient stock for product ${productName}. Available: ${availableStock}, Required: ${item.quantity}`,
            400
          );
        }
      }
    }

    // Update stock levels
    if (operation.type === 'receipt') {
      // Add stock to destination
      for (const item of operation.operation_items) {
        await stockService.updateStock(
          item.product_id,
          operation.destination_location_id,
          item.quantity,
          'add',
          connection
        );
        
        // Log move history
        await moveHistoryService.logMove({
          product_id: item.product_id,
          operation_id: operation.id,
          from_location: null,
          to_location: operation.destination_location_id,
          quantity: item.quantity
        }, connection);
      }
    } else if (operation.type === 'delivery') {
      // Deduct stock from source
      for (const item of operation.operation_items) {
        await stockService.updateStock(
          item.product_id,
          operation.source_location_id,
          item.quantity,
          'subtract',
          connection
        );
        
        // Log move history
        await moveHistoryService.logMove({
          product_id: item.product_id,
          operation_id: operation.id,
          from_location: operation.source_location_id,
          to_location: null,
          quantity: item.quantity
        }, connection);
      }
    } else if (operation.type === 'transfer') {
      // Deduct from source, add to destination
      for (const item of operation.operation_items) {
        await stockService.updateStock(
          item.product_id,
          operation.source_location_id,
          item.quantity,
          'subtract',
          connection
        );
        
        await stockService.updateStock(
          item.product_id,
          operation.destination_location_id,
          item.quantity,
          'add',
          connection
        );
        
        // Log move history
        await moveHistoryService.logMove({
          product_id: item.product_id,
          operation_id: operation.id,
          from_location: operation.source_location_id,
          to_location: operation.destination_location_id,
          quantity: item.quantity
        }, connection);
      }
    }

    // Update operation status
    await connection.execute(
      'UPDATE operations SET status = ? WHERE id = ?',
      ['done', operationId]
    );

    await connection.commit();

    // Fetch complete updated operation
    const completeOperation = await getOperationDetails(operationId);

    // Emit real-time events
    if (io) {
      io.emit('operation:updated', completeOperation);
      io.emit('stock:updated', {
        operation_id: operationId,
        type: operation.type
      });
    }

    return completeOperation;
  } catch (error) {
    await connection.rollback();
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to validate operation: ' + error.message, 500);
  } finally {
    connection.release();
  }
};
