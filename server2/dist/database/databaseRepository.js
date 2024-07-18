"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _DatabaseRepository_instances, _DatabaseRepository_validate, _DatabaseRepository_isAllowedColumn, _DatabaseRepository_validateQueryParams, _DatabaseRepository_excludeFields;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Factory = void 0;
const db_1 = __importDefault(require("./db"));
const joi_1 = __importDefault(require("joi"));
const userSchema = joi_1.default.object({
    username: joi_1.default.string().min(3).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(3).required(),
});
const personSchema = joi_1.default.object({
    id: joi_1.default.string(),
    name: joi_1.default.string(),
    email: joi_1.default.string().email(),
    phone: joi_1.default.string(),
    website: joi_1.default.string(),
    facebook: joi_1.default.string(),
    linkedin: joi_1.default.string(),
    link: joi_1.default.string(),
    hebrew_name: joi_1.default.string(),
});
const boardSchema = joi_1.default.object({
    id: joi_1.default.string(),
    title: joi_1.default.string(),
});
class QueryBuilder {
    constructor(tableName) {
        this.tableName = tableName;
        this.query = '';
        this.values = [];
        this.count = 1;
    }
    select(fields = '*') {
        this.query = `SELECT ${fields} FROM ${this.tableName} `;
        return this;
    }
    join(table) {
        if (table) {
            this.query += ` JOIN ${table}`;
        }
        return this;
    }
    on(condition) {
        if (condition) {
            this.query += ` ON ${condition}`;
        }
        return this;
    }
    where(conditions) {
        if (Object.keys(conditions).length) {
            const conditionStr = Object.entries(conditions)
                .map(([key, value]) => {
                if (value)
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
        console.log('query: ', this.query);
        return { query: this.query, values: this.values };
    }
}
class DatabaseRepository {
    constructor(tableName, schema, allowedSearchKeys) {
        _DatabaseRepository_instances.add(this);
        this.tableName = tableName;
        this.schema = schema;
        this.allowedSearchKeys = allowedSearchKeys;
    }
    create(body) {
        __classPrivateFieldGet(this, _DatabaseRepository_instances, "m", _DatabaseRepository_validate).call(this, body);
        const columns = Object.keys(body).join(', ');
        const placeholders = Object.keys(body)
            .map((_, index) => `$${index + 1}`)
            .join(', ');
        const values = Object.values(body);
        const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
        return db_1.default.query(query, values);
    }
    findById(id) {
        const query = `SELECT * FROM ${this.tableName} WHERE id=$1`;
        return db_1.default.query(query, [id]);
    }
    findByIdAndDelete(id) {
        const query = `DELETE FROM ${this.tableName} WHERE id=$1 RETURNING *`;
        return db_1.default.query(query, [id]);
    }
    findByIdAndUpdate(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const columns = Object.keys(body);
            const values = Object.values(body);
            if (columns.some((column) => !__classPrivateFieldGet(this, _DatabaseRepository_instances, "m", _DatabaseRepository_isAllowedColumn).call(this, column))) {
                throw new Error('Incorrect body');
            }
            const coumnsAndValueNums = columns
                .map((column, index) => `${column} = $${index + 2}`)
                .join(', ');
            const query = ` UPDATE ${this.tableName} SET ${coumnsAndValueNums} WHERE id = $1 RETURNING *`;
            return db_1.default.query(query, [id, ...values]);
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
        });
    }
    findAll(queryParams) {
        const { fields, sort, limit, page, join, on } = queryParams;
        const queryObj = __classPrivateFieldGet(this, _DatabaseRepository_instances, "m", _DatabaseRepository_excludeFields).call(this, queryParams);
        const notAllowedKeys = __classPrivateFieldGet(this, _DatabaseRepository_instances, "m", _DatabaseRepository_validateQueryParams).call(this, queryObj);
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
        return db_1.default.query(query, values);
    }
}
_DatabaseRepository_instances = new WeakSet(), _DatabaseRepository_validate = function _DatabaseRepository_validate(body) {
    const { error } = this.schema.validate(body);
    if (error)
        throw new Error('Validation Error');
}, _DatabaseRepository_isAllowedColumn = function _DatabaseRepository_isAllowedColumn(column) {
    return this.allowedSearchKeys.includes(column);
}, _DatabaseRepository_validateQueryParams = function _DatabaseRepository_validateQueryParams(queryObj) {
    return Object.keys(queryObj).some((key) => !__classPrivateFieldGet(this, _DatabaseRepository_instances, "m", _DatabaseRepository_isAllowedColumn).call(this, key));
}, _DatabaseRepository_excludeFields = function _DatabaseRepository_excludeFields(queryParams) {
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'join', 'on'];
    return Object.keys(queryParams).reduce((acc, key) => {
        if (!excludedFields.includes(key)) {
            acc[key] = queryParams[key];
        }
        return acc;
    }, {});
};
class Factory {
    constructor() { }
    static userRepository() {
        const allowedKeys = ['id', 'username', 'email', 'password'];
        return new DatabaseRepository('users', userSchema, allowedKeys);
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
exports.Factory = Factory;
