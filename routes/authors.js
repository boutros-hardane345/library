const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const authorController = require('../controllers/authorController');

router.use(protect);

router.get('/',         authorController.index);
router.get('/new',      restrictTo('admin', 'librarian'), authorController.newForm);
router.post('/',        restrictTo('admin', 'librarian'), authorController.create);
router.get('/:id',      authorController.show);
router.get('/:id/edit', restrictTo('admin', 'librarian'), authorController.editForm);
router.put('/:id',      restrictTo('admin', 'librarian'), authorController.update);
router.delete('/:id',   restrictTo('admin'),              authorController.delete);

module.exports = router;
