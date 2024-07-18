import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

import app from './app';

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`${process.env.NODE_ENV}: App running on port ${port}...`);
});
