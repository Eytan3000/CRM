import dotenv from 'dotenv';

// process.on('uncaughtException', (err) => {
//   console.log('Uncaught exception! Shutting down...');
//   console.log(err.name, err.message);
//   process.exit(1);
// });

dotenv.config({ path: './config.env' });

import app from './app';

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  console.log(`${process.env.NODE_ENV}: App running on port ${port}...`);
});

// process.on('unhandledRejection', (err: Error) => {
//   console.log('Unhandle rejection! Shutting down...');
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });
