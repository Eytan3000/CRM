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

const findByIdQuery = 'SELECT * FROM <TABLE> WHERE id=$1';
const updateQueryBase = 'UPDATE <TABLE> SET';
const deleteQuery = 'DELETE FROM <TABLE> WHERE id =$1 RETURNING *';
const getAllQuery = 'SELECT * FROM <TABLE>';

class Endpoint {
  constructor(tableName) {
    this.tableName = tableName;
    const replaceTableWithUsers = (query) =>
      query.replace('<TABLE>', this.tableName);

    this.getAllQuery = replaceTableWithUsers(getAllQuery);
    this.findByIdQuery = replaceTableWithUsers(findByIdQuery);
    this.updateQueryBase = replaceTableWithUsers(updateQueryBase);
    this.deleteQuery = replaceTableWithUsers(deleteQuery);
  }
  #validateUser(body) {
    const { error } = this.schema.validate(body);
    console.log('error: ', error); //removeEytan

    if (error) return false;
    return true;
  }
  #isAllowedColumn(column) {
    if (!this.allowedSearchKeys.includes(column)) {
      return false;
    }
    return true;
  }

  // _validateSearchQueryParams(queryParams) {
  //   const queryParamsKeys = Object.keys(queryParams);
  //   const areKeysAllowed = queryParamsKeys.every((key) =>
  //     this.allowedSearchKeys.includes(key)
  //   );
  //   if (!areKeysAllowed) {
  //     return false;
  //   }
  //   return true;
  // }
  #excludeFieldsQueryParams(queryParams) {
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    const queryObj = { ...queryParams };
    excludedFields.forEach((el) => delete queryObj[el]);

    return queryObj;
  }

  create(body) {
    if (!this.#validateUser(body)) throw new Error('Invalid user');

    const columns = Object.keys(body).join(', ');
    const placeholders = Object.keys(body)
      .map((_, index) => `$${index + 1}`)
      .join(', ');
    const values = Object.values(body);

    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *;`;
    console.log('query: ', query); //removeEytan
    return db.query(query, values);
  }

  findById(id) {
    const intId = Number(id);
    return db.query(this.findByIdQuery, [intId]);
  }
  findByIdAndUpdate(id, body) {
    const intId = Number(id);
    console.log('body: ', body); //removeEytan

    const column = Object.keys(body)[0];
    const val = Object.values(body)[0];
    console.log('val: ', val); //removeEytan

    if (!this.#isAllowedColumn(column)) {
      throw new Error('Invalid column name');
    }

    const query = `${this.updateQueryBase} ${column} = $1 WHERE id = $2 RETURNING *;`;
    console.log('query: ', query); //removeEytan

    return db.query(query, [val, intId]);
  }
  findByIdAndDelete(id) {
    const intId = Number(id);

    return db.query(this.deleteQuery, [intId]);
  }
  findAll(queryParams) {
    console.log('queryParams: ', queryParams); //removeEytan
    const queryKeysArr = Object.keys(queryParams);
    const queryObj = this.#excludeFieldsQueryParams(queryParams);

    // //  Advanced Filtering
    // let queryStr = JSON.stringify(queryObj);
    // console.log('queryStr1: ', queryStr); //removeEytan
    // // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}

    // Filtering by columns
    console.log('this.getAllQuery: ', this.getAllQuery); //removeEytan

    let query = this.getAllQuery;
    console.log('query1: ', query); //removeEytan
    const values = [];
    let count = 1;
    if (Object.keys(queryObj).length) {
      query = query + ' WHERE';
      let queryTail = '';

      for (const param in queryObj) {
        queryTail = `${queryTail} ${param}=$${count} AND`;
        values.push(queryObj[param]);
        count++;
      }
      queryTail = queryTail.slice(0, -4);
      query = query + queryTail;
    }

    // SORT
    if (queryKeysArr.includes('sort')) {
      query = query + ' ORDER BY ' + queryParams.sort;
    }
    // LIMIT
    if (queryKeysArr.includes('limit')) {
      query = query + ' LIMIT ' + queryParams.limit;
    }

    // FIELDS
    if (queryKeysArr.includes('fields')) {
      const fieldsArr = queryParams.fields
        .split(',')
        .map((field) => field.trim());
      const invalidFields = fieldsArr.some(
        (field) => !this.#isAllowedColumn(field)
      );
      if (invalidFields) {
        throw new Error('Invalid fields specified');
      }
      const fields = fieldsArr.join(', ');

      query = query.replace('*', fields);
      console.log('queryFields: ', query); //removeEytan
    }

    // PAGINATION:

    if (queryKeysArr.includes('page')) {
      const page = queryParams.page * 1 || 1; // page input from user
      const limit = queryParams.limit * 1 || 10; // results per page
      const skip = (page - 1) * limit;

      query = query + ` OFFSET $${count}`;
      values.push(skip);
    }

    console.log('query: ', query); //removeEytan
    console.log('values: ', values); //removeEytan

    return db.query(query, values);
  }
}

class User extends Endpoint {
  constructor() {
    super('users');
    this.schema = userSchema;
    this.allowedSearchKeys = ['id', 'username', 'email', 'password'];
  }
}

class Person extends Endpoint {
  constructor() {
    super('persons');
    this.schema = personSchema;
    this.allowedSearchKeys = [
      'name',
      'email',
      'phone',
      'website',
      'facebook',
      'linkedin',
      'link',
      'hebrew_name',
    ];
  }
}

class Borad extends Endpoint {
  constructor() {
    super('boards');
    this.schema = boardSchema;
    this.allowedSearchKeys = ['title'];
  }
}

const user = new User();
const person = new Person();
const board = new Borad();

module.exports = { user, person, board };
