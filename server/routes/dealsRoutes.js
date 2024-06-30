const express = require('express');
const dealsController = require('../controllers/dealsController');

const router = express.Router();

router
  .route('/')
  .post(dealsController.createDeal);
router
  .route('/:id')
  .get(dealsController.getDeal)
  .patch(dealsController.updateDeal)
  .delete(dealsController.deleteDeal);

module.exports = router;
