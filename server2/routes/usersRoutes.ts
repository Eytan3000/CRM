import express from 'express';
// import usersController from '../controllers/usersController';
import usersController from '../controllers/usersController';
import authController from '../controllers/authController';

export const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);

router.post('/forgotPassword', authController.forgotPassword);
// router.post('/resetPassword', authController.resetPassword);

router.route('/').get(authController.protect, usersController.getAllUsers);

router
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(
    authController.protect,
    authController.restrictTo('ADMIN'), 
    usersController.deleteUser
  );
