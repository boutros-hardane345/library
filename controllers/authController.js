const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const Member = require('../models/Member');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sendTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register', error: null });
};

exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.render('auth/register', { title: 'Register', error: 'Passwords do not match.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.render('auth/register', { title: 'Register', error: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password, role: 'member' });

    // Auto-create Member profile
    await new Member({ user: user._id }).save();

    const token = signToken(user._id);
    sendTokenCookie(res, token);
    res.redirect('/dashboard');
  } catch (err) {
    const message = err.code === 11000 ? 'Email already registered.' : (err.message || 'Registration failed.');
    res.render('auth/register', { title: 'Register', error: message });
  }
};

exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login', error: null });
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.render('auth/login', { title: 'Login', error: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('auth/login', { title: 'Login', error: 'Invalid email or password.' });
    }

    const token = signToken(user._id);
    sendTokenCookie(res, token);
    res.redirect('/dashboard');
  } catch (err) {
    res.render('auth/login', { title: 'Login', error: 'Login failed. Try again.' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/auth/login');
};
