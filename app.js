require('dotenv').config();
const express        = require('express');
const cookieParser   = require('cookie-parser');
const methodOverride = require('method-override');
const path           = require('path');
const connectDB      = require('./config/db');
const { setCurrentUser } = require('./middleware/auth');

const authRoutes      = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const bookRoutes      = require('./routes/books');
const authorRoutes    = require('./routes/authors');
const memberRoutes    = require('./routes/members');
const loanRoutes      = require('./routes/loans');

const app = express();

// Connect to MongoDB
connectDB();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(setCurrentUser);

// Routes
app.get('/', (req, res) => res.redirect('/dashboard'));
app.use('/auth',      authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/books',     bookRoutes);
app.use('/authors',   authorRoutes);
app.use('/members',   memberRoutes);
app.use('/loans',     loanRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 – Not Found',
    message: `The page "${req.path}" does not exist.`,
    currentUser: res.locals.currentUser
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: '500 – Server Error',
    message: 'Something went wrong on the server.',
    currentUser: res.locals.currentUser
  });
});

// Start server — bind to 0.0.0.0 for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 LibraFlow running on port ${PORT}`);
});
