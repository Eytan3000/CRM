import express from 'express';
import cors from 'cors'; // Import the cors package
const app = express();

import { router as usersRouter } from './routes/usersRoutes.js';
import { router as personsRouter } from './routes/personsRouter.js';
import AppError from './utils/appErrors.js';
import globalErrorHandler from './controllers/errorController.js';

// const organizationsRouter = require('./routes/organizationsRoutes');
// const boardsRouter = require('./routes/boardsRoutes');
// const stagesRouter = require('./routes/stagesRoutes');
// const dealsRouter = require('./routes/dealsRoutes');
// const notesRouter = require('./routes/notesRoutes');

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json()); // for post body
app.use((req, res, next) => {
  console.log('Hello from the middleware!');
  next();
});

// Middelware, Mounting the routers
app.use('/users', usersRouter);
app.use('/persons', personsRouter);
// app.use('/organizations', organizationsRouter);
// app.use('/boards', boardsRouter);
// app.use('/stages', stagesRouter);
// app.use('/deals', dealsRouter);
// app.use('/notes', notesRouter);

// handling all other url requests returning an error message
app.all('*', (req, res, next) => {
  const err = new AppError(
    `Can't find ${req.originalUrl} on this server.`,
    404
  );
  next(err);
});

app.use(globalErrorHandler);

export default app;
