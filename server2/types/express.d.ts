// types/express.d.ts
// import { User } from './path/to/your/user/model'; // Adjust the import path as needed

import { UserBody } from '../database/databaseRepository';

declare global {
  namespace Express {
    interface Request {
      user?: UserBody;
    }
  }
}
