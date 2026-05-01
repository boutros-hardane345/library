const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const loanController = require('../controllers/loanController');

router.use(protect);

router.get('/',              restrictTo('admin', 'librarian'), loanController.index);
router.get('/new',           restrictTo('admin', 'librarian'), loanController.newForm);
router.post('/',             restrictTo('admin', 'librarian'), loanController.create);
router.get('/:id',           restrictTo('admin', 'librarian'), loanController.show);
router.get('/:id/edit',      restrictTo('admin', 'librarian'), loanController.editForm);
router.put('/:id',           restrictTo('admin', 'librarian'), loanController.update);
router.post('/:id/return',   restrictTo('admin', 'librarian'), loanController.returnBook);
router.delete('/:id',        restrictTo('admin'),              loanController.delete);

module.exports = router;
