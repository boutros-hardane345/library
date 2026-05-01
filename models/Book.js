const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: [true, 'Author is required']
  },
  isbn: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
    match: [/^(?:\d{9}[\dX]|\d{13})$/, 'Invalid ISBN format']
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    enum: ['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography',
           'Technology', 'Philosophy', 'Literature', 'Mystery', 'Other']
  },
  publishedYear: {
    type: Number,
    min: [1000, 'Invalid year'],
    max: [new Date().getFullYear() + 1, 'Published year too far in future']
  },
  totalCopies: {
    type: Number,
    required: [true, 'Total copies is required'],
    min: [1, 'Must have at least 1 copy'],
    default: 1
  },
  availableCopies: {
    type: Number,
    min: [0, 'Available copies cannot be negative'],
    default: function () { return this.totalCopies; }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  coverColor: {
    type: String,
    default: '#4f46e5'
  }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
