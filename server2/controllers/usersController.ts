import { NextFunction, Request, Response } from 'express';
import { QueryParams, Factory } from '../database/databaseRepository';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appErrors';

// import { user: User } from '../models/models';
const User = Factory.userRepository();

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

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await User.findAll(req.query as QueryParams);
    res.status(200).json({
      status: 'success',
      message: result.rows,
    });
  }
);

const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await User.findByIdAndUpdate(id, req.body);

    if (result.rowCount === 0) {
      return next(new AppError(`No results for id ${id}`, 404));
    }

    res.status(200).json({
      status: 'success',
      message: result.rows,
    });
  }
);

// const signup = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { username, email, password, passwordConfirm } = req.body;

//     if (password !== passwordConfirm)
//       throw new AppError(`Passwords do not match`, 400);

//     const objToCreate = { username, email, password };
//     const result = await User.create(objToCreate);
//     res.status(200).json({
//       status: 'success',
//       message: result.rows,
//     });
//   }
// );

const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await User.findById(id);

    if (result.rowCount === 0) {
      return next(new AppError(`No results for id ${id}`, 404));
    }

    res.status(200).json({
      status: 'success',
      message: result.rows,
    });
  }
);

const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await User.findByIdAndDelete(id);

    if (result.rowCount === 0) {
      return next(new AppError(`No results for id ${id}`, 404));
    }

    res.status(200).json({
      status: 'success',
      message: result.rows,
    });
  }
);

export default {
  // checkBody,
  getAllUsers,
  updateUser,
  getUser,
  deleteUser,
};
