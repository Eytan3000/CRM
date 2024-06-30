const express = require('express');
const usersController = require('../controllers/usersController');

const router = express.Router();

router
  .route('/')
  .get(usersController.getAllUsers)
  .post(
    // usersController.checkBody,
     usersController.createUser);
router
  .route('/:id')
  .get(usersController.getUser)
  .patch(
    // usersController.checkBody, 
    usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
