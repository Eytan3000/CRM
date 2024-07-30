import { userSchema, personSchema, boardSchema } from './schemas';
import { DatabaseManager } from './databaseManager';
import crypto from 'crypto';

export interface UserBody {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
  password_reset_token?: string;
  password_reset_expires?: number;
}

export class Factory {
  constructor() {}

  static userRepository() {
    const allowedKeys = [
      'id',
      'username',
      'email',
      'role',
      'password_reset_token',
      'password_reset_expires',
    ];

    return new DatabaseManager<UserBody>('users', userSchema, allowedKeys);
  }

  static personRepository() {
    const allowedKeys = [
      'id',
      'name',
      'email',
      'phone',
      'website',
      'facebook',
      'linkedin',
      'link',
      'hebrew_name',
    ];
    return new DatabaseManager('persons', personSchema, allowedKeys);
  }
  static boardRepository() {
    const allowedKeys = ['title'];
    return new DatabaseManager('boards', boardSchema, allowedKeys);
  }
}
