import { Pool } from 'pg';

// make sure port is number
const port = process.env.DB_PORT
  ? parseInt(process.env.DB_PORT, 10)
  : undefined;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port,
  database: process.env.DB_DATABASE,
});

export default {
  query: (text: string, params: (string | number | boolean)[]) =>
    pool.query(text, params),
  connect: () => pool.connect(),
};
