loanSchema.pre('save', async function (next) {
  try {
    if (this.isNew) {

      // Prevent duplicate active loan
      const existingLoan = await mongoose.model('Loan').findOne({
        member: this.member,
        book: this.book,
        status: { $in: ['active', 'overdue'] }
      });

      if (existingLoan) {
        return next(new Error('Member already has this book and has not returned it.'));
      }

      // Atomic decrement (safe)
      const updatedBook = await mongoose.model('Book').findOneAndUpdate(
        {
          _id: this.book,
          availableCopies: { $gt: 0 }
        },
        { $inc: { availableCopies: -1 } },
        { new: true }
      );

      if (!updatedBook) {
        return next(new Error('No copies available'));
      }
    }

    // Overdue check
    if (this.status === 'active' && new Date() > this.dueDate) {
      this.status = 'overdue';
    }

    next();

  } catch (err) {
    next(err);
  }
});