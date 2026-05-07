const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  loanDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'overdue', 'returned'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 2000
  }
}, { timestamps: true });

// Prevent duplicate open loans for same member+book.
// Returned loans are allowed so members can re-borrow later.
loanSchema.index(
  { member: 1, book: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['active', 'overdue'] } }
  }
);

// Support common filters and dashboard queries.
loanSchema.index({ status: 1, dueDate: 1, createdAt: -1 });

module.exports = mongoose.model('Loan', loanSchema);
