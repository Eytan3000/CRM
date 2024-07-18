import express from 'express';
// import usersController from '../controllers/usersController';
import usersController from '../controllers/usersController';

export const router = express.Router();

router
  .route('/')
  .get(usersController.getAllUsers)
  .post(usersController.createUser);
router
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);
