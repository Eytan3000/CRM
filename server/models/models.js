const db = require('../db');
const Joi = require('joi');

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

class QueryBuilder {
  constructor(tableName) {
    this.tableName = tableName;
    this.query = '';
    this.values = [];
    this.count = 1;
  }

  select(fields = '*') {
    this.query = `SELECT ${fields} FROM ${this.tableName}`;
    return this;
  }

  where(conditions) {
    if (Object.keys(conditions).length) {
      const conditionStr = Object.entries(conditions)
        .map(([key, value]) => {
          this.values.push(value);
          return `${key}=$${this.count++}`;
        })
        .join(' AND ');
      this.query += ` WHERE ${conditionStr}`;
    }
    return this;
  }

  orderBy(sort) {
    if (sort) {
      this.query += ` ORDER BY ${sort}`;
    }
    return this;
  }

  limit(limit) {
    if (limit) {
      this.query += ` LIMIT ${limit}`;
    }
    return this;
  }

  offset(offset) {
    if (offset) {
      this.query += ` OFFSET $${this.count}`;
      this.values.push(offset);
    }
    return this;
  }

  build() {
    return { query: this.query, values: this.values };
  }
}

class Endpoint {
  constructor(tableName, schema, allowedSearchKeys) {
    this.tableName = tableName;
    this.schema = schema;
    this.allowedSearchKeys = allowedSearchKeys;
  }

  #validate(body) {
    const { error } = this.schema.validate(body);
    if (error) throw new Error('Validation Error');
  }

  #isAllowedColumn(column) {
    return this.allowedSearchKeys.includes(column);
  }
  #excludeFields(queryParams) {
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    return Object.keys(queryParams).reduce((acc, key) => {
      if (!excludedFields.includes(key)) {
        acc[key] = queryParams[key];
      }
      return acc;
    }, {});
  }

  create(body) {
    this.#validate(body);
    const columns = Object.keys(body).join(', ');
    const placeholders = Object.keys(body)
      .map((_, index) => `$${index + 1}`)
      .join(', ');
    const values = Object.values(body);
    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
    return db.query(query, values);
  }

  findById(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE id=$1`;
    return db.query(query, [id]);
  }

  findByIdAndUpdate(id, body) {
    this.#validate(body);
    const column = Object.keys(body)[0];
    const value = Object.values(body)[0];
    if (!this.#isAllowedColumn(column)) {
      throw new Error('Invalid column name');
    }
    const query = `UPDATE ${this.tableName} SET ${column}=$1 WHERE id=$2 RETURNING *`;
    return db.query(query, [value, id]);
  }

  findByIdAndDelete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id=$1 RETURNING *`;
    return db.query(query, [id]);
  }

  findAll(queryParams) {
    const { fields, sort, limit, page } = queryParams;
    const queryObj = this.#excludeFields(queryParams);

    const builder = new QueryBuilder(this.tableName)
      .select(fields)
      .where(queryObj)
      .orderBy(sort)
      .limit(limit)
      .offset((page - 1) * limit || 0);

    const { query, values } = builder.build();
    return db.query(query, values);
  }
}

class Director {
  constructor() {}
  createUser() {
    return new Endpoint('users', userSchema, [
      'id',
      'username',
      'email',
      'password',
    ]);
  }
  createPerson() {
    return new Endpoint('persons', personSchema, [
      'id',
      'name',
      'email',
      'phone',
      'website',
      'facebook',
      'linkedin',
      'link',
      'hebrew_name',
    ]);
  }
  createBorad() {
    return new Endpoint('boards', boardSchema, ['title']);
  }
}

const user = new Director().createUser();
const person = new Director().createPerson();
const board = new Director().createBorad();

module.exports = { user, person, board };
