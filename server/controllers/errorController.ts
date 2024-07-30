import { Request, Response, NextFunction } from 'express';
import { DatabaseError } from 'pg';
import AppError from '../utils/appErrors';
import { ValidationError } from 'joi';

const handleDuplicateFields = (error: DatabaseError) => {
  const message = error.detail!;
  return new AppError(message, 400);
};

const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  // Operational, trusted error => send it to the client
  if (err.isOperational === true) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming error or other unknown error => don't leak error to client
  else {
    // log error:
    console.error('Error 💥 :', err);

    // send generic message to client
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

export default (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (err instanceof DatabaseError) {
      if (err.code === '23505') error = handleDuplicateFields(err);
    }

    if (err instanceof AppError) {
      error.message = err.message;
    }

    sendErrorProd(error, res);
  }
};
