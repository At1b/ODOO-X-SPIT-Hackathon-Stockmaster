require('dotenv').config();
const pool = require('../config/database');

const createTables = async () => {
  const connection = await pool.getConnection();

  try {
    console.log('Creating tables...');

    // Categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100) UNIQUE NOT NULL,
        unit VARCHAR(50) NOT NULL,
        category_id INT,
        barcode_data TEXT,
        low_stock INT DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);

    // Product locations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        location_id VARCHAR(255) NOT NULL,
        quantity INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_product_location (product_id, location_id)
      )
    `);

    // Reordering rules table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reordering_rules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        min_quantity INT DEFAULT 0,
        reorder_quantity INT DEFAULT 0,
        enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Stock movements table (for initial adjustments)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        location_id VARCHAR(255),
        quantity INT NOT NULL,
        movement_type ENUM('adjustment', 'in', 'out') DEFAULT 'adjustment',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
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
