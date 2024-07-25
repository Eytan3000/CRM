import express from 'express';
// import usersController from '../controllers/usersController';
import usersController from '../controllers/usersController';
import authController from '../controllers/authController';

export const router = express.Router();

router.route('/signup').post(authController.signup);

router.route('/').get(usersController.getAllUsers);

router
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);
