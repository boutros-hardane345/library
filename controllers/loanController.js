const Loan   = require('../models/Loan');
const Book   = require('../models/Book');
const Member = require('../models/Member');

const populateLoan = [
  { path: 'member', populate: { path: 'user', select: 'name email' } },
  { path: 'book', select: 'title genre author', populate: { path: 'author', select: 'name' } }
];

const coerceDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

// GET /loans
exports.index = async (req, res) => {
  try {
    // Keep statuses fresh for UI filters
    await Loan.updateMany(
      { status: 'active', dueDate: { $lt: new Date() } },
      { $set: { status: 'overdue' } }
    );

    const { status } = req.query;
    const filter = {};
    if (status && ['active', 'overdue', 'returned'].includes(status)) filter.status = status;

    const loans = await Loan.find(filter)
      .sort({ createdAt: -1 })
      .populate(populateLoan);

    res.render('loans/index', { title: 'Loans', loans, status: filter.status || null });
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};

// GET /loans/new
exports.newForm = async (req, res) => {
  try {
    const [members, books] = await Promise.all([
      Member.find({ isActive: true }).populate('user', 'name').sort({ createdAt: -1 }),
      Book.find({ availableCopies: { $gt: 0 } }).sort({ title: 1 })
    ]);

    res.render('loans/new', {
      title: 'New Loan',
      members,
      books,
      error: null
    });
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};

exports.create = async (req, res) => {
  try {
    const { member, book, dueDate, notes } = req.body;
    const due = coerceDate(dueDate);
    if (!due) throw new Error('Invalid due date.');

    // ✅ 1. Prevent duplicate ACTIVE loan
    const existingLoan = await Loan.findOne({
      member,
      book,
      status: { $in: ['active', 'overdue'] }
    });

    if (existingLoan) {
      throw new Error('This member already borrowed this book.');
    }

    // ✅ 2. Atomic book decrement (SAFE)
    const updatedBook = await Book.findOneAndUpdate(
      { _id: book, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true }
    );

    if (!updatedBook) {
      throw new Error('No copies available for this book.');
    }

    // ✅ 3. Create loan
    const loan = await Loan.create({
      member,
      book,
      dueDate: due,
      notes
    });

    res.redirect(`/loans/${loan._id}`);

  } catch (err) {
    const members = await Member.find({ isActive: true }).populate('user', 'name');
    const books   = await Book.find({ availableCopies: { $gt: 0 } });

    res.render('loans/new', {
      title: 'New Loan',
      members,
      books,
      error: err.message
    });
  }
};

// GET /loans/:id
exports.show = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate(populateLoan);
    if (!loan) return res.status(404).render('error', { title: '404', message: 'Loan not found', currentUser: req.user });

    res.render('loans/show', { title: 'Loan Details', loan, currentUser: req.user });
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};

// GET /loans/:id/edit
exports.editForm = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate(populateLoan);
    if (!loan) return res.status(404).render('error', { title: '404', message: 'Loan not found', currentUser: req.user });

    res.render('loans/edit', { title: 'Edit Loan', loan, error: null });
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};

// PUT /loans/:id
exports.update = async (req, res) => {
  try {
    const due = coerceDate(req.body.dueDate);
    if (!due) throw new Error('Invalid due date.');

    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).render('error', { title: '404', message: 'Loan not found', currentUser: req.user });
    if (loan.status === 'returned') throw new Error('Returned loans cannot be edited.');

    loan.dueDate = due;
    loan.notes = req.body.notes;
    // If due date is moved into the future, clear overdue
    if (loan.status === 'overdue' && due >= new Date()) loan.status = 'active';
    await loan.save();

    res.redirect(`/loans/${loan._id}`);
  } catch (err) {
    const loan = await Loan.findById(req.params.id).populate(populateLoan);
    if (!loan) return res.status(404).render('error', { title: '404', message: 'Loan not found', currentUser: req.user });
    res.render('loans/edit', { title: 'Edit Loan', loan, error: err.message });
  }
};

// POST /loans/:id/return
exports.returnBook = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).render('error', { title: '404', message: 'Loan not found', currentUser: req.user });

    if (loan.status !== 'returned') {
      loan.status = 'returned';
      loan.returnDate = new Date();
      await loan.save();
      await Book.findByIdAndUpdate(loan.book, { $inc: { availableCopies: 1 } });
    }

    res.redirect(`/loans/${loan._id}`);
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};

// DELETE /loans/:id
exports.delete = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).render('error', { title: '404', message: 'Loan not found', currentUser: req.user });

    const needsRestock = loan.status !== 'returned';
    const bookId = loan.book;
    await Loan.findByIdAndDelete(req.params.id);

    if (needsRestock) {
      await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: 1 } });
    }

    res.redirect('/loans');
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};
