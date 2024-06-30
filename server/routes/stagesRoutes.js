const express = require('express');
const stagesController = require('../controllers/stagesController');
const router = express.Router();

router.param('id', (req, res, next, val) => {
  console.log(`Stage's id is ${val}`);
  next();
});

router
  .route('/')
  .post(stagesController.createStage);
router
  .route('/:id')
  .get(stagesController.getStage)
  .patch(stagesController.updateStage)
  .delete(stagesController.deleteStage);

module.exports = router;
