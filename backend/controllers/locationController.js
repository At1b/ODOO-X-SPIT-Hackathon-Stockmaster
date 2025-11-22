const pool = require('../config/database');
const Joi = require('joi');

const locationSchema = Joi.object({
  name: Joi.string().required().max(255),
  code: Joi.string().required().max(50),
  parent_id: Joi.number().integer().optional().allow(null),
});

exports.getAllLocations = async (req, res) => {
  try {
    const [locations] = await pool.query(
      `SELECT l.*, pl.name as parent_name
       FROM locations l
       LEFT JOIN locations pl ON l.parent_id = pl.location_id
       ORDER BY l.name`
    );

    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch locations',
    });
  }
};

exports.getLocationById = async (req, res) => {
  try {
    const [locations] = await pool.query(
      `SELECT l.*, pl.name as parent_name
       FROM locations l
       LEFT JOIN locations pl ON l.parent_id = pl.location_id
       WHERE l.location_id = ?`,
      [req.params.id]
    );

    if (locations.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Location not found',
      });
    }

    res.json({
      success: true,
      data: locations[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch location',
    });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const { error, value } = locationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const [result] = await pool.query(
      'INSERT INTO locations (name, code, parent_id) VALUES (?, ?, ?)',
      [value.name, value.code, value.parent_id || null]
    );

    res.status(201).json({
      success: true,
      data: {
        location_id: result.insertId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to create location',
    });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { error, value } = locationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    await pool.query(
      'UPDATE locations SET name = ?, code = ?, parent_id = ? WHERE location_id = ?',
      [value.name, value.code, value.parent_id || null, req.params.id]
    );

    res.json({
      success: true,
      message: 'Location updated successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to update location',
    });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    await pool.query('DELETE FROM locations WHERE location_id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Location deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete location',
    });
  }
};
