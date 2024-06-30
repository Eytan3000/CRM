const express = require('express');
const boardsController = require('../controllers/boardsController');
const router = express.Router();

router.param('id', (req, res, next, val) => {
  console.log(`person's id is ${val}`);
  next();
});

router
  .route('/')
  .get(boardsController.getAllboards)
  .post(boardsController.createBoard);
router
  .route('/:id')
  .get(boardsController.getBoard)
  .patch(boardsController.updateBoard)
  .delete(boardsController.deleteBoard);

module.exports = router;
