import mysql from "mysql2/promise";

// Create connection pool
const pool = await mysql.createPool({
    host: "sql12.freesqldatabase.com",
    user: "sql12808934",
    password: "pNWB367nhp",
    database: "sql12808934",
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

console.log("✅ MySQL connected successfully");

// ✔ EXPORT DEFAULT (important!)
export default pool;
