const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Member is required']
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book is required']
  },
  loanDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  returnDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'returned', 'overdue'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, { timestamps: true });

// Middleware to update book availability and check for overdue status
loanSchema.pre('save', async function (next) {
  if (this.isNew) {
    const book = await mongoose.model('Book').findById(this.book);

    if (!book || book.availableCopies <= 0) {
      throw new Error('No copies available');
    }

    const updatedBook = await mongoose.model('Book').findOneAndUpdate(
  { _id: this.book, availableCopies: { $gt: 0 } },
  { $inc: { availableCopies: -1 } },
  { new: true }
);

if (!updatedBook) {
  throw new Error('No copies available');
}
  }

  // existing overdue logic
  if (this.status === 'active' && new Date() > this.dueDate) {
    this.status = 'overdue';
  }

  next();
});

// Middleware to update book availability when a loan is returned
loanSchema.pre('save', async function (next) {
  if (this.isModified('status') && this.status === 'returned') {
    const book = await mongoose.model('Book').findById(this.book);

    if (book) {
      book.availableCopies += 1;
      await book.save();
    }
  }

  next();
});

module.exports = mongoose.model('Loan', loanSchema);
