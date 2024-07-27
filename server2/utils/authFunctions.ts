import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { promisify } from 'util';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export function getJwtToken(id: string) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
}

export function checkPassword(candidatePassword: string, userPassword: string) {
  return bcrypt.compare(candidatePassword, userPassword);
}

// export function getDecodedJwt(token: string) {
//   return promisify(jwt.verify)(token, process.env.JWT_SECRET);
// }

export function getDecodedJwt(token: string): Promise<JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) reject(err);

      resolve(decoded as JwtPayload);
    });
  });
}

export function changedPasswordAfter(
  jwtTimestamp: number,
  passwordChangesAt: Date
) {

  if (passwordChangesAt) {
    const changedTimestamp = passwordChangesAt.getTime() / 1000;
    return jwtTimestamp < changedTimestamp;
  }

  return false;
}
