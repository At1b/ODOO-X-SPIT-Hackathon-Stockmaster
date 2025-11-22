require('dotenv').config();
const pool = require('../config/database');

const createTables = async () => {
  const connection = await pool.getConnection();

  try {
    console.log('Creating tables...');

    // Products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        product_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100) UNIQUE NOT NULL,
        category VARCHAR(100) NOT NULL,
        uom VARCHAR(50) NOT NULL,
        low_stock_threshold INT DEFAULT 10,
        initial_stock INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Locations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS locations (
        location_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        parent_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES locations(location_id) ON DELETE SET NULL
      )
    `);

    // Product stock levels table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_stock_levels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        location_id INT NOT NULL,
        quantity INT DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
        FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE,
        UNIQUE KEY unique_product_location (product_id, location_id)
      )
    `);

    // Insert default location if not exists
    await connection.query(`
      INSERT IGNORE INTO locations (name, code)
      VALUES ('Main Warehouse', 'MAIN')
    `);

    console.log('Tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    connection.release();
    await pool.end();
  }
};

createTables();
