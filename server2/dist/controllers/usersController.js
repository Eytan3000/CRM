"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const databaseRepository_1 = require("../database/databaseRepository");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const appErrors_1 = __importDefault(require("../utils/appErrors"));
// import { user: User } from '../models/models';
const User = databaseRepository_1.Factory.userRepository();
// middleware checks:
// const checkBody = (req: Request, res: Response, next: NextFunction) => {
//   const { username, email, password } = req.body;
//   console.log('username: ', username); //removeEytan
//   console.log('email: ', email); //removeEytan
//   if (username !== undefined && typeof username !== 'string') {
//     return res.status(404).json({
//       status: 'error',
//       message: 'username must be a string',
//     });
//   }
//   // if (
//   //   email !== undefined &&
//   //   (typeof email !== 'string' || !validateEmail(email))
//   // ) {
//   //   return res.status(404).json({
//   //     status: 'error',
//   //     message: 'Invalid email',
//   //   });
//   // }
//   // // TODO: password validation?
//   next();
// };
const getAllUsers = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield User.findAll(req.query);
    res.status(200).json({
        status: 'success',
        message: result.rows,
    });
}));
const updateUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield User.findByIdAndUpdate(id, req.body);
    if (result.rowCount === 0) {
        return next(new appErrors_1.default(`No results for id ${id}`, 404));
    }
    res.status(200).json({
        status: 'success',
        message: result.rows,
    });
}));
const createUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield User.create(req.body);
    res.status(200).json({
        status: 'success',
        message: result.rows,
    });
}));
const getUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield User.findById(id);
    if (result.rowCount === 0) {
        return next(new appErrors_1.default(`No results for id ${id}`, 404));
    }
    res.status(200).json({
        status: 'success',
        message: result.rows,
    });
}));
const deleteUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield User.findByIdAndDelete(id);
    if (result.rowCount === 0) {
        return next(new appErrors_1.default(`No results for id ${id}`, 404));
    }
    console.log('result: ', result); //removeEytan
    res.status(200).json({
        status: 'success',
        message: result.rows,
    });
}));
exports.default = {
    // checkBody,
    getAllUsers,
    updateUser,
    createUser,
    getUser,
    deleteUser,
};
