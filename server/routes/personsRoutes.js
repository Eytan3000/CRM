const express = require('express');
const personsController = require('../controllers/personsController');
const router = express.Router();

router.param('id', (req, res, next, val) => {
  console.log(`person's id is ${val}`);
  next();
});

router
  .route('/')
  .get(personsController.getAllPersons)
  .post(personsController.createPerson);
router
  .route('/:id')
  .get(personsController.getPerson)
  .patch(personsController.updatePerson)
  .delete(personsController.deletePerson);

module.exports = router;
