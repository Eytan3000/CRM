import db from './db';
import Joi from 'joi';

const userSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(3).required(),
});
const personSchema = Joi.object({
  id: Joi.string(),
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
  website: Joi.string(),
  facebook: Joi.string(),
  linkedin: Joi.string(),
  link: Joi.string(),
  hebrew_name: Joi.string(),
});
const boardSchema = Joi.object({
  id: Joi.string(),
  title: Joi.string(),
});

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

class DatabaseRepository<T extends Record<string, any>> {
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

  #validate(body: any) {
    const { error } = this.schema.validate(body);
    if (error) throw new Error('Validation Error');
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

  create(body: T) {
    this.#validate(body);
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

  findByIdAndDelete(id: string) {
    const query = `DELETE FROM ${this.tableName} WHERE id=$1 RETURNING *`;
    return db.query(query, [id]);
  }

  async findByIdAndUpdate(id: string, body: T) {
    const columns = Object.keys(body);
    const values = Object.values(body);

    if (columns.some((column) => !this.#isAllowedColumn(column))) {
      throw new Error('Incorrect body');
    }

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

export class Factory {
  constructor() {}

  static userRepository() {
    const allowedKeys = ['id', 'username', 'email', 'password'];

    interface UserBody {
      username: string;
      email: string;
      password: string;
    }

    return new DatabaseRepository<UserBody>('users', userSchema, allowedKeys);
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
    return new DatabaseRepository('persons', personSchema, allowedKeys);
  }
  static boardRepository() {
    const allowedKeys = ['title'];
    return new DatabaseRepository('boards', boardSchema, allowedKeys);
  }
}
