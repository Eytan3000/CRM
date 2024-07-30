import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appErrors';
import {
  changedPasswordAfter,
  checkPassword,
  creatPasswordResetToken,
  excludePassword,
  getDecodedJwt,
  getJwtToken,
} from '../utils/authFunctions';
import { Factory } from '../database/Factory';
import { sendEmail } from '../utils/email';

const User = Factory.userRepository();

const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      username,
      email,
      password,
      passwordConfirm,
      role = 'USER',
    } = req.body;

    if (password !== passwordConfirm)
      throw new AppError(`Passwords do not match`, 400);

    const objToCreate = { username, email, password, role };
    const result = await User.create(objToCreate);

    result.rows = excludePassword(result.rows);
    const newUser = result.rows[0];

    const token = getJwtToken(newUser.id);

    res.status(200).json({
      status: 'success',
      token,
      message: newUser,
    });
  }
);

const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password.', 400));
    }

    const {
      rows: [user],
    } = await User.findByEmail(email);

    if (!user || !(await checkPassword(password, user.password)))
      return next(new AppError('Incorrect email or password.', 401));

    const token = getJwtToken(user.id);

    res.status(200).json({
      status: 'success',
      token,
    });
  }
);

const protect = catchAsync(async (req, res, next) => {
  // 1) get the token and check if it exists
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access', 401)
    );
  }

  // 2) Verification - validate the token
  const decoded = await getDecodedJwt(token);

  // 3) check if user still exists
  const {
    rows: [currentUser],
  } = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError('The user for this token no longer exists', 401));
  }

  // 4) check if user changed passwords after JWT was issued
  const { password_updated_at } = currentUser;

  if (
    password_updated_at &&
    decoded.iat &&
    changedPasswordAfter(decoded.iat, password_updated_at)
  ) {
    return next(
      new AppError(
        'User recently changed the password. Please log in again.',
        401
      )
    );
  }

  req.user = currentUser;

  next();
});

const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('No user found in request', 500));

    if (!roles.includes(req.user.role)) {
      return next(new AppError('No permission to perform action', 403));
    }

    next();
  };
};

const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1) get user based on posted email
  const {
    rows: [user],
  } = await User.findByEmail(req.body.email);

  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  // 2) genrate random token
  const { resetToken, passwordResetToken, passwordResetExpires } =
    creatPasswordResetToken();

  User.findByIdAndUpdate(user.id, {
    password_reset_token: passwordResetToken,
    password_reset_expires: passwordResetExpires,
  });

  // 3) send it to the user's email
  try {
    await sendEmail(user.email, req, resetToken);

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    const body = {
      password_reset_token: undefined,
      password_reset_expires: undefined,
    };

    // await user.save({ validateBeforeSave: false });
    await User.findByIdAndUpdate(user.id, body);

    return next(new AppError('Error sending email.', 500));
  }
};

export default {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
};
