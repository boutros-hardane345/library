const Loan   = require('../models/Loan');
const Book   = require('../models/Book');
const Member = require('../models/Member');

exports.index = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status) filter.status = status;

    const loans = await Loan.find(filter)
      .populate({ path: 'member', populate: { path: 'user', select: 'name' } })
      .populate('book', 'title genre')
      .sort({ loanDate: -1 });

    res.render('loans/index', { title: 'Loans', loans, status });
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};

exports.newForm = async (req, res) => {
  const members = await Member.find({ isActive: true }).populate('user', 'name');
  const books   = await Book.find({ availableCopies: { $gt: 0 } }).sort({ title: 1 });
  res.render('loans/new', { title: 'New Loan', members, books, error: null });
};

exports.create = async (req, res) => {
  try {
    const { member, book, dueDate, notes } = req.body;

    const bookDoc = await Book.findById(book);
    if (!bookDoc || bookDoc.availableCopies < 1) {
      throw new Error('No copies available for this book.');
    }

    const loan = await Loan.create({ member, book, dueDate, notes });
    bookDoc.availableCopies -= 1;
    await bookDoc.save();

    res.redirect(`/loans/${loan._id}`);
  } catch (err) {
    const members = await Member.find({ isActive: true }).populate('user', 'name');
    const books   = await Book.find({ availableCopies: { $gt: 0 } }).sort({ title: 1 });
    res.render('loans/new', { title: 'New Loan', members, books, error: err.message });
  }
};

exports.show = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate({ path: 'member', populate: { path: 'user', select: 'name email' } })
      .populate({ path: 'book', populate: { path: 'author', select: 'name' } });
    if (!loan) return res.status(404).render('error', { title: '404', message: 'Loan not found', currentUser: req.user });
    res.render('loans/show', { title: 'Loan Details', loan });
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};

exports.editForm = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('member').populate('book');
    res.render('loans/edit', { title: 'Edit Loan', loan, error: null });
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};

exports.update = async (req, res) => {
  try {
    const { dueDate, notes } = req.body;
    await Loan.findByIdAndUpdate(req.params.id, { dueDate, notes }, { runValidators: true });
    res.redirect(`/loans/${req.params.id}`);
  } catch (err) {
    const loan = await Loan.findById(req.params.id).populate('member').populate('book');
    res.render('loans/edit', { title: 'Edit Loan', loan, error: err.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).render('error', { title: '404', message: 'Loan not found', currentUser: req.user });
    if (loan.status === 'returned') return res.redirect(`/loans/${loan._id}`);

    loan.returnDate = new Date();
    loan.status     = 'returned';
    await loan.save();

    await Book.findByIdAndUpdate(loan.book, { $inc: { availableCopies: 1 } });
    res.redirect(`/loans/${loan._id}`);
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};

exports.delete = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (loan && loan.status !== 'returned') {
      await Book.findByIdAndUpdate(loan.book, { $inc: { availableCopies: 1 } });
    }
    await Loan.findByIdAndDelete(req.params.id);
    res.redirect('/loans');
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};
