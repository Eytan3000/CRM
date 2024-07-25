import { NextFunction, Request, Response } from 'express';
import { QueryParams, Factory } from '../database/databaseRepository';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appErrors';
import jwt from 'jsonwebtoken';

const User = Factory.userRepository();

const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password, passwordConfirm } = req.body;

    if (password !== passwordConfirm)
      throw new AppError(`Passwords do not match`, 400);

    const objToCreate = { username, email, password };
    const newUser = await User.create(objToCreate);

    const token = jwt.sign(
      { id: newUser.rows[0].id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.JWT_EXPIRE_IN,
      }
    );

    res.status(200).json({
      status: 'success',
      token,
      message: newUser.rows[0],
    });
  }
);

export default {
  signup,
};
