const db = require('../config/db');

const addPhoneNumberColumn = async () => {
    try {
        const query = `
      ALTER TABLE users
      ADD COLUMN phone_number VARCHAR(15) UNIQUE AFTER email
    `;
        await db.query(query);
        console.log('Added phone_number column to users table.');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('phone_number column already exists.');
            process.exit(0);
        }
        console.error('Error adding phone_number column:', error);
        process.exit(1);
    }
};

addPhoneNumberColumn();
