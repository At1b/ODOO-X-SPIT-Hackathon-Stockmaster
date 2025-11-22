const pool = require('../config/database');
const Joi = require('joi');

const categorySchema = Joi.object({
  name: Joi.string().required().max(255),
  description: Joi.string().allow('').max(1000),
});

exports.getAllCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT * FROM categories ORDER BY name ASC'
    );

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const [result] = await pool.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [value.name, value.description]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        ...value,
      },
    });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        error: 'Category name already exists',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create category',
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    await pool.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [value.name, value.description, req.params.id]
    );

    res.json({
      success: true,
      message: 'Category updated successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to update category',
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete category',
    });
  }
};
