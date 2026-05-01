const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [150, 'Name cannot exceed 150 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  nationality: {
    type: String,
    trim: true,
    maxlength: [100, 'Nationality cannot exceed 100 characters']
  },
  birthYear: {
    type: Number,
    min: [1000, 'Invalid birth year'],
    max: [new Date().getFullYear(), 'Birth year cannot be in the future']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  }
}, { timestamps: true });

module.exports = mongoose.model('Author', authorSchema);
