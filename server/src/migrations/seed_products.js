const db = require('../config/db');

const seedProducts = async () => {
    const products = [
        ['Laptop', 'ELEC-001', 50, 5, 'Electronics'],
        ['Mouse', 'ELEC-002', 5, 10, 'Electronics'], // Low stock
        ['Keyboard', 'ELEC-003', 0, 5, 'Electronics'], // Out of stock
        ['Chair', 'FURN-001', 20, 2, 'Furniture'],
        ['Desk', 'FURN-002', 15, 2, 'Furniture']
    ];

    const query = 'INSERT IGNORE INTO Products (name, sku, quantity, min_stock_level, category) VALUES ?';

    try {
        await db.query(query, [products]);
        console.log('Products seeded successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts();
