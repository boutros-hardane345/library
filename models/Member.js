const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  membershipId: {
    type: String,
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true,
    maxlength: [300, 'Address cannot exceed 300 characters']
  },
  membershipType: {
    type: String,
    enum: ['standard', 'premium', 'student'],
    default: 'standard'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Auto-generate membershipId before saving
memberSchema.pre('save', async function (next) {
  if (!this.membershipId) {
    const count = await mongoose.model('Member').countDocuments();
    this.membershipId = `LIB-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Member', memberSchema);
