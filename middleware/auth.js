const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.redirect('/auth/login');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.clearCookie('token');
      return res.redirect('/auth/login');
    }

    req.user = user;
    res.locals.currentUser = user;
    next();
  } catch (err) {
    res.clearCookie('token');
    return res.redirect('/auth/login');
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to perform this action.',
        currentUser: req.user
      });
    }
    next();
  };
};

const setCurrentUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findById(decoded.id).select('-password');
      res.locals.currentUser = user || null;
    } else {
      res.locals.currentUser = null;
    }
  } catch {
    res.locals.currentUser = null;
  }
  next();
};

module.exports = { protect, restrictTo, setCurrentUser };
