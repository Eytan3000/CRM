const express = require('express');
const app = express();
const morgan = require('morgan');

const usersRouter = require('./routes/usersRoutes');
const personsRouter = require('./routes/personsRoutes');
const organizationsRouter = require('./routes/organizationsRoutes');
const boardsRouter = require('./routes/boardsRoutes');
const stagesRouter = require('./routes/stagesRoutes');
const dealsRouter = require('./routes/dealsRoutes');
const notesRouter = require('./routes/notesRoutes');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //logs requests info
}

app.use(express.json()); // for post body
app.use((req, res, next) => {
  console.log('Hello from the middleware!');
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Middelware, Mounting the routers
app.use('/users', usersRouter);
app.use('/persons', personsRouter);
app.use('/organizations', organizationsRouter);
app.use('/boards', boardsRouter);
app.use('/stages', stagesRouter);
app.use('/deals', dealsRouter);
app.use('/notes', notesRouter);

module.exports = app;
