"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
// make sure port is number
const port = process.env.DB_PORT
    ? parseInt(process.env.DB_PORT, 10)
    : undefined;
const pool = new pg_1.Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port,
    database: process.env.DB_DATABASE,
});
exports.default = {
    query: (text, params) => pool.query(text, params),
    connect: () => pool.connect(),
};
