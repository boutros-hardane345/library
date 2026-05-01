const User = require('../models/User');

// GET /profile
exports.getProfile = (req, res) => {
  res.render('profile', { title: 'My Profile', error: null, success: null });
};

// POST /profile/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.render('profile', { title: 'My Profile', error: 'All fields are required.', success: null });
    }
    if (newPassword.length < 6) {
      return res.render('profile', { title: 'My Profile', error: 'New password must be at least 6 characters.', success: null });
    }
    if (newPassword !== confirmPassword) {
      return res.render('profile', { title: 'My Profile', error: 'New passwords do not match.', success: null });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.render('profile', { title: 'My Profile', error: 'Current password is incorrect.', success: null });
    }

    user.password = newPassword;
    await user.save(); // bcrypt hook hashes it automatically

    res.render('profile', { title: 'My Profile', error: null, success: 'Password changed successfully!' });
  } catch (err) {
    res.render('profile', { title: 'My Profile', error: err.message, success: null });
  }
};