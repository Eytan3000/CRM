"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const personsController_1 = __importDefault(require("../controllers/personsController"));
exports.router = express_1.default.Router();
exports.router
    .route('/')
    .get(personsController_1.default.getAllPersons)
    .post(personsController_1.default.createPerson);
exports.router
    .route('/:id')
    .get(personsController_1.default.getPerson)
    .patch(personsController_1.default.updatePerson)
    .delete(personsController_1.default.deletePerson);
