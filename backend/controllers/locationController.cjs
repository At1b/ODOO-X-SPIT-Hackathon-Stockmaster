const pool = require('../config/database.cjs');

exports.getAllLocations = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM locations ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch locations' });
  }
};

exports.getLocationById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM locations WHERE location_id = ?', [req.params.id]);
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, error: 'Location not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch location' });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const { name, code, parent_id } = req.body;
    const [result] = await pool.query('INSERT INTO locations (name, code, parent_id, created_at) VALUES (?, ?, ?, NOW())', [name, code || null, parent_id || null]);
    res.status(201).json({ success: true, data: { location_id: result.insertId } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to create location' });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { name, code, parent_id } = req.body;
    await pool.query('UPDATE locations SET name = ?, code = ?, parent_id = ? WHERE location_id = ?', [name, code, parent_id, req.params.id]);
    res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to update location' });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    await pool.query('DELETE FROM product_stock_levels WHERE location_id = ?', [req.params.id]);
    await pool.query('DELETE FROM locations WHERE location_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Location deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to delete location' });
  }
};
