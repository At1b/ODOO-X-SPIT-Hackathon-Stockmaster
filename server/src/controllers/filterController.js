const db = require('../config/db');

exports.getCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category');
        const categoryList = categories.map(c => c.category);
        res.json(categoryList);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getLocations = async (req, res) => {
    try {
        const [locations] = await db.query('SELECT location_id, location_name FROM locations ORDER BY location_name');
        res.json(locations);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getStatuses = async (req, res) => {
    try {
        const statuses = [
            { value: 'all', label: 'All' },
            { value: 'in_stock', label: 'In Stock' },
            { value: 'low_stock', label: 'Low Stock' },
            { value: 'out_of_stock', label: 'Out of Stock' }
        ];
        res.json(statuses);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
