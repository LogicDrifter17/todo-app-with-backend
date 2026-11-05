import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "Todo",
    password: "Arun@123",
    port: 5432
});

export default pool;