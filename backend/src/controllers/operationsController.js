import { AppError } from '../middleware/errorHandler.js';
import {
  createOperation,
  getOperationsList,
  getOperationDetails,
  validateOperationService
} from '../services/operationsService.js';
import { z } from 'zod';

// Validation schemas
const operationItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().positive()
});

const receiptSchema = z.object({
  supplier: z.string().min(1),
  destination_location_id: z.string().uuid(),
  items: z.array(operationItemSchema).min(1)
});

const deliverySchema = z.object({
  customer: z.string().min(1),
  source_location_id: z.string().uuid(),
  items: z.array(operationItemSchema).min(1)
});

const transferSchema = z.object({
  source_location_id: z.string().uuid(),
  destination_location_id: z.string().uuid(),
  items: z.array(operationItemSchema).min(1)
});

export const createReceipt = async (req, res, next) => {
  try {
    const validated = receiptSchema.parse(req.body);
    const operation = await createOperation({
      type: 'receipt',
      status: 'draft',
      destination_location_id: validated.destination_location_id,
      supplier: validated.supplier,
      items: validated.items,
      created_by: req.user.id
    }, req.app.get('io'));

    res.status(201).json({
      success: true,
      data: operation
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Validation error: ' + error.errors.map(e => e.message).join(', '), 400));
    }
    next(error);
  }
};

export const createDelivery = async (req, res, next) => {
  try {
    const validated = deliverySchema.parse(req.body);
    const operation = await createOperation({
      type: 'delivery',
      status: 'draft',
      source_location_id: validated.source_location_id,
      customer: validated.customer,
      items: validated.items,
      created_by: req.user.id
    }, req.app.get('io'));

    res.status(201).json({
      success: true,
      data: operation
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Validation error: ' + error.errors.map(e => e.message).join(', '), 400));
    }
    next(error);
  }
};

export const createTransfer = async (req, res, next) => {
  try {
    const validated = transferSchema.parse(req.body);
    
    if (validated.source_location_id === validated.destination_location_id) {
      return next(new AppError('Source and destination locations must be different', 400));
    }

    const operation = await createOperation({
      type: 'transfer',
      status: 'draft',
      source_location_id: validated.source_location_id,
      destination_location_id: validated.destination_location_id,
      items: validated.items,
      created_by: req.user.id
    }, req.app.get('io'));

    res.status(201).json({
      success: true,
      data: operation
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Validation error: ' + error.errors.map(e => e.message).join(', '), 400));
    }
    next(error);
  }
};

export const getOperations = async (req, res, next) => {
  try {
    const { type, status, warehouse_id, product_id } = req.query;
    const operations = await getOperationsList({ type, status, warehouse_id, product_id });
    
    res.json({
      success: true,
      data: operations
    });
  } catch (error) {
    next(error);
  }
};

export const getOperationById = async (req, res, next) => {
  try {
    const operation = await getOperationDetails(req.params.id);
    
    if (!operation) {
      return next(new AppError('Operation not found', 404));
    }

    res.json({
      success: true,
      data: operation
    });
  } catch (error) {
    next(error);
  }
};

export const validateOperation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const operation = await validateOperationService(id, req.app.get('io'));

    res.json({
      success: true,
      data: operation,
      message: 'Operation validated successfully'
    });
  } catch (error) {
    next(error);
  }
};


