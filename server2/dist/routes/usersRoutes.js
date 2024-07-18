"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
// import usersController from '../controllers/usersController';
const usersController_1 = __importDefault(require("../controllers/usersController"));
exports.router = express_1.default.Router();
exports.router
    .route('/')
    .get(usersController_1.default.getAllUsers)
    .post(usersController_1.default.createUser);
exports.router
    .route('/:id')
    .get(usersController_1.default.getUser)
    .patch(usersController_1.default.updateUser)
    .delete(usersController_1.default.deleteUser);
