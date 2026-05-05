// Loan.js
const mongoose = require('mongoose');

// 1. FIRST define the schema
const loanSchema = new mongoose.Schema({
  // Your schema fields here
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  interestRate: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 2. THEN add the pre-save middleware
loanSchema.pre('save', async function (next) {
  // Your pre-save logic here
  console.log('Saving loan document...');
  // Example: Calculate something before saving
  // this.totalPayment = this.amount * (1 + this.interestRate / 100);
  next();
});

// 3. FINALLY create and export the model
const Loan = mongoose.model('Loan', loanSchema);
module.exports = Loan;