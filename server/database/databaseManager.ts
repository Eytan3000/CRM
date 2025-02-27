import db from './db';
import Joi from 'joi';
import AppError from '../utils/appErrors';

import { hashPassword, hasPassword } from '../utils/authFunctions';

// export interface UserBody {
//   username: string;
//   email: string;
//   password: string;
//   role: string;
// }

export interface QueryParams {
  [key: string]: string | number | undefined;
  fields?: string;
  sort?: string;
  limit?: number;
  page?: number;
  join?: string;
  on?: string;
}

class QueryBuilder {
  private tableName: string;
  private query: string;
  private values: (string | number)[];
  private count: number;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.query = '';
    this.values = [];
    this.count = 1;
  }

  select(fields = '*') {
    this.query = `SELECT ${fields} FROM ${this.tableName} `;
    return this;
  }

  join(table?: string) {
    if (table) {
      this.query += ` JOIN ${table}`;
    }
    return this;
  }
  on(condition?: string) {
    if (condition) {
      this.query += ` ON ${condition}`;
    }
    return this;
  }

  where(conditions: QueryParams) {
    if (Object.keys(conditions).length) {
      const conditionStr = Object.entries(conditions)
        .map(([key, value]) => {
          if (value) this.values.push(value);
          return `${key}=$${this.count++}`;
        })
        .join(' AND ');
      this.query += ` WHERE ${conditionStr}`;
    }
    return this;
  }

  orderBy(sort?: string) {
    if (sort) {
      this.query += ` ORDER BY ${sort}`;
    }
    return this;
  }

  limit(limit?: number) {
    if (limit) {
      this.query += ` LIMIT ${limit}`;
    }
    return this;
  }

  offset(offset?: number) {
    if (offset) {
      this.query += ` OFFSET $${this.count}`;
      this.values.push(offset);
    }
    return this;
  }

  build() {
    console.log('query: ', this.query);
    return { query: this.query, values: this.values };
  }
}

export class DatabaseManager<T extends Record<string, any>> {
  private tableName: string;
  private schema: Joi.Schema;
  private allowedSearchKeys: string[];

  constructor(
    tableName: string,
    schema: Joi.Schema,
    allowedSearchKeys: string[]
  ) {
    this.tableName = tableName;
    this.schema = schema;
    this.allowedSearchKeys = allowedSearchKeys;
  }

  #validate(body: T) {
    const { error } = this.schema.validate(body);

    if (error) throw new Error('Validation Error' + error);
  }
  #validateSomeForUpdate(body: T) {
    // Define the schema for the specific property
    const values = Object.values(body);
    let message = '';

    Object.keys(body).forEach((key, index) => {
      const { error } = this.schema.extract(key).validate(values[index]);
      if (error) {
        console.log(error.details[0].message.replace('value', key));
        message += error.details[0].message.replace('value', key) + '. ';
      }
    });

    if (message !== '') throw new AppError(message, 400);
  }

  #isAllowedColumn(column: string) {
    return this.allowedSearchKeys.includes(column);
  }

  #validateQueryParams(queryObj: Record<string, any>) {
    return Object.keys(queryObj).some((key) => !this.#isAllowedColumn(key));
  }

  #excludeFields(queryParams: QueryParams) {
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'join', 'on'];
    return Object.keys(queryParams).reduce((acc, key) => {
      if (!excludedFields.includes(key)) {
        acc[key] = queryParams[key];
      }
      return acc;
    }, {} as QueryParams);
  }

  async create(body: T) {
    this.#validate(body);

    if (hasPassword(body)) {
      body.password = await hashPassword(body.password);
    }

    const columns = Object.keys(body).join(', ');
    const placeholders = Object.keys(body)
      .map((_, index) => `$${index + 1}`)
      .join(', ');
    const values = Object.values(body);
    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
    return db.query(query, values);
  }

  findById(id: string | number) {
    const query = `SELECT * FROM ${this.tableName} WHERE id=$1`;
    return db.query(query, [id]);
  }

  findByEmail(email: string) {
    const query = `SELECT * FROM ${this.tableName} WHERE email=$1`;
    return db.query(query, [email]);
  }

  findByIdAndDelete(id: string) {
    const query = `DELETE FROM ${this.tableName} WHERE id=$1 RETURNING *`;
    return db.query(query, [id]);
  }

  async findByIdAndUpdate(id: string, body: T) {
    const columns = Object.keys(body);
    const values = Object.values(body);

    this.#validateSomeForUpdate(body);

    const coumnsAndValueNums = columns
      .map((column, index) => `${column} = $${index + 2}`)
      .join(', ');

    const query = ` UPDATE ${this.tableName} SET ${coumnsAndValueNums} WHERE id = $1 RETURNING *`;

    return db.query(query, [id, ...values]);

    // TRANSACTION
    // const client = await db.connect();
    // try {
    //   await client.query('BEGIN');

    //   let result;

    //   if (!value) {
    //     // If user cancels reservation, no need for database locks
    //     const query = `UPDATE ${this.tableName} SET ${column}=$1 WHERE id=$2 RETURNING *`;
    //     result = await client.query(query, [value, id]);
    //   } else {
    //     // Use database locks for updating reservation => FOR UPDATE serializes access to the row, while the transaction promises atomicity, avoiding race conditions.
    //     const selectQuery = `SELECT * FROM ${this.tableName} WHERE id = $1 FOR UPDATE`;
    //     await client.query(selectQuery, [id]); // Lock the row

    //     const updateQuery = `UPDATE ${this.tableName} SET ${column} = $1 WHERE id = $2 AND is_reserved != true RETURNING *`;
    //     result = await client.query(updateQuery, [value, id]);
    //   }

    //   await client.query('COMMIT');
    //   return result;
    // } catch (err) {
    //   await client.query('ROLLBACK');
    //   throw err;
    // } finally {
    //   client.release();
    // }
  }

  findAll(queryParams: QueryParams) {
    const { fields, sort, limit, page, join, on } = queryParams;
    const queryObj = this.#excludeFields(queryParams);

    const notAllowedKeys = this.#validateQueryParams(queryObj);

    if (notAllowedKeys) {
      throw new Error('Invalid query params');
    }

    const offsetValue = page ? (page - 1) * (limit || 0) : 0;

    const builder = new QueryBuilder(this.tableName)
      .select(fields)
      .join(join)
      .on(on)
      .where(queryObj)
      .orderBy(sort)
      .limit(limit)
      .offset(offsetValue);

    const { query, values } = builder.build();
    return db.query(query, values);
  }
}

// class UserDatabaseManager extends DatabaseManager<UserBody> {
//   constructor() {
//     super();
//   }
// }
