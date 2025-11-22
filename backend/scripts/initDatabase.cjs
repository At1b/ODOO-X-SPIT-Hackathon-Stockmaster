const pool = require('../config/database.cjs');

async function init() {
  try {
    // Create tables if not exists following the exact schema
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        product_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(255) NOT NULL UNIQUE,
        category VARCHAR(255) NOT NULL,
        uom VARCHAR(50) NOT NULL,
        low_stock_threshold INT DEFAULT 0,
        initial_stock INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS locations (
        location_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50),
        parent_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_stock_levels (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        location_id INT NOT NULL,
        quantity INT DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
        FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // ensure a Main Warehouse exists
    const [rows] = await pool.query('SELECT * FROM locations WHERE name = ?', ['Main Warehouse']);
    if (rows.length === 0) {
      await pool.query('INSERT INTO locations (name, code, parent_id, created_at) VALUES (?, ?, NULL, NOW())', ['Main Warehouse', 'MAIN']);
      console.log('Inserted Main Warehouse location');
    }

    console.log('Database initialized');
    process.exit(0);
  } catch (error) {
    console.error('Init DB error', error);
    process.exit(1);
  }
}

init();
