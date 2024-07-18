"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors")); // Import the cors package
const app = (0, express_1.default)();
const usersRoutes_js_1 = require("./routes/usersRoutes.js");
const personsRouter_js_1 = require("./routes/personsRouter.js");
const appErrors_js_1 = __importDefault(require("./utils/appErrors.js"));
const errorController_js_1 = __importDefault(require("./controllers/errorController.js"));
// const organizationsRouter = require('./routes/organizationsRoutes');
// const boardsRouter = require('./routes/boardsRoutes');
// const stagesRouter = require('./routes/stagesRoutes');
// const dealsRouter = require('./routes/dealsRoutes');
// const notesRouter = require('./routes/notesRoutes');
app.use((0, cors_1.default)({ origin: 'http://localhost:5173' }));
app.use(express_1.default.json()); // for post body
app.use((req, res, next) => {
    console.log('Hello from the middleware!');
    next();
});
// Middelware, Mounting the routers
app.use('/users', usersRoutes_js_1.router);
app.use('/persons', personsRouter_js_1.router);
// app.use('/organizations', organizationsRouter);
// app.use('/boards', boardsRouter);
// app.use('/stages', stagesRouter);
// app.use('/deals', dealsRouter);
// app.use('/notes', notesRouter);
// handling all other url requests returning an error message
app.all('*', (req, res, next) => {
    const err = new appErrors_js_1.default(`Can't find ${req.originalUrl} on this server.`, 404);
    next(err);
});
app.use(errorController_js_1.default);
exports.default = app;
