const express = require('express');
const organizationsController = require('../controllers/organizationsController');
const router = express.Router();

router.param('id', (req, res, next, val) => {
  console.log(`person's id is ${val}`);
  next();
});

router
  .route('/')
  .post(organizationsController.createOrganization);
router
  .route('/:id')
  .get(organizationsController.getOrganization)
  .patch(organizationsController.updateOrganization)
  .delete(organizationsController.deleteOrganization);

module.exports = router;
