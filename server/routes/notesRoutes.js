const express = require('express');
const notesController = require('../controllers/notesController');

const router = express.Router();

router
  .route('/')
  .post(notesController.createNote);
router
  .route('/:id')
  .get(notesController.getNote)
  .patch(notesController.updateNote)
  .delete(notesController.deleteNote);

module.exports = router;
