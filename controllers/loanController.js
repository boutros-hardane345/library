const Loan   = require('../models/Loan');
const Book   = require('../models/Book');
const Member = require('../models/Member');

exports.create = async (req, res) => {
  try {
    const { member, book, dueDate, notes } = req.body;

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
      dueDate,
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