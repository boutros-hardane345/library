const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const memberController = require('../controllers/memberController');

router.use(protect);

router.get('/',         restrictTo('admin', 'librarian'), memberController.index);
router.get('/new',      restrictTo('admin'),              memberController.newForm);
router.post('/',        restrictTo('admin'),              memberController.create);
router.get('/:id',      restrictTo('admin', 'librarian'), memberController.show);
router.get('/:id/edit', restrictTo('admin', 'librarian'), memberController.editForm);
router.put('/:id',      restrictTo('admin', 'librarian'), memberController.update);
router.delete('/:id',   restrictTo('admin'),              memberController.delete);

module.exports = router;
