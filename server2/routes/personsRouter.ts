import express, { Express, request, response } from 'express';

import personsController from '../controllers/personsController';

export const router = express.Router();

router
  .route('/')
  .get(personsController.getAllPersons)
  .post(personsController.createPerson);
router
  .route('/:id')
  .get(personsController.getPerson)
  .patch(personsController.updatePerson)
  .delete(personsController.deletePerson);
