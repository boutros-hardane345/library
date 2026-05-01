const Author = require('../models/Author');
const Book   = require('../models/Book');

exports.index = async (req, res) => {
  try {
    const authors = await Author.find().sort({ name: 1 });
    res.render('authors/index', { title: 'Authors', authors });
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};

exports.newForm = (req, res) => {
  res.render('authors/new', { title: 'Add Author', error: null });
};

exports.create = async (req, res) => {
  try {
    const { name, bio, nationality, birthYear, email } = req.body;
    const author = await Author.create({ name, bio, nationality, birthYear: birthYear || undefined, email: email || undefined });
    res.redirect(`/authors/${author._id}`);
  } catch (err) {
    res.render('authors/new', { title: 'Add Author', error: err.message });
  }
};

exports.show = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).render('error', { title: '404', message: 'Author not found', currentUser: req.user });
    const books = await Book.find({ author: author._id }).sort({ title: 1 });
    res.render('authors/show', { title: author.name, author, books, error: null });
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};

exports.editForm = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).render('error', { title: '404', message: 'Author not found', currentUser: req.user });
    res.render('authors/edit', { title: 'Edit Author', author, error: null });
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, bio, nationality, birthYear, email } = req.body;
    await Author.findByIdAndUpdate(req.params.id,
      { name, bio, nationality, birthYear: birthYear || undefined, email: email || undefined },
      { runValidators: true }
    );
    res.redirect(`/authors/${req.params.id}`);
  } catch (err) {
    const author = await Author.findById(req.params.id);
    res.render('authors/edit', { title: 'Edit Author', author, error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const bookCount = await Book.countDocuments({ author: req.params.id });
    if (bookCount > 0) {
      const author = await Author.findById(req.params.id);
      const books  = await Book.find({ author: req.params.id });
      return res.render('authors/show', {
        title: author.name, author, books,
        error: 'Cannot delete author with existing books. Remove all books first.'
      });
    }
    await Author.findByIdAndDelete(req.params.id);
    res.redirect('/authors');
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};
