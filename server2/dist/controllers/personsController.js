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
Object.defineProperty(exports, "__esModule", { value: true });
const databaseRepository_1 = require("../database/databaseRepository");
const Person = databaseRepository_1.Factory.personRepository();
const getAllPersons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield Person.findAll(req.query);
        res.status(200).json({
            status: 'success',
            message: result.rows,
        });
    }
    catch (err) {
        res.status(500).json({
            status: 'error',
            message: err instanceof Error ? err.message : 'An unknown error occurred',
        });
    }
});
const updatePerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield Person.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).json({
            status: 'success',
            message: result.rows,
        });
    }
    catch (err) {
        res.status(500).json({
            status: 'error',
            message: err instanceof Error ? err.message : 'An unknown error occurred',
        });
    }
});
const createPerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield Person.create(req.body);
        res.status(200).json({
            status: 'success',
            message: result.rows,
        });
    }
    catch (err) {
        res.status(500).json({
            status: 'error',
            message: err,
        });
    }
});
const getPerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield Person.findById(id);
        res.status(200).json({
            status: 'success',
            message: result.rows,
        });
    }
    catch (err) {
        res.status(500).json({
            status: 'error',
            message: err,
        });
    }
});
const deletePerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield Person.findByIdAndDelete(req.params.id);
        console.log('result: ', result); //removeEytan
        res.status(200).json({
            status: 'success',
            message: result.rows,
        });
    }
    catch (err) {
        res.status(500).json({
            status: 'error',
            message: err,
        });
    }
});
exports.default = {
    getAllPersons,
    updatePerson,
    createPerson,
    getPerson,
    deletePerson,
};
