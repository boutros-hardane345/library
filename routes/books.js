const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const bookController = require('../controllers/bookController');

router.use(protect);

router.get('/',         bookController.index);
router.get('/new',      restrictTo('admin', 'librarian'), bookController.newForm);
router.post('/',        restrictTo('admin', 'librarian'), bookController.create);
router.get('/:id',      bookController.show);
router.get('/:id/edit', restrictTo('admin', 'librarian'), bookController.editForm);
router.put('/:id',      restrictTo('admin', 'librarian'), bookController.update);
router.delete('/:id',   restrictTo('admin'),              bookController.delete);

module.exports = router;
