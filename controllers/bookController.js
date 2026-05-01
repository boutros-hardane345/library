const Book   = require('../models/Book');
const Author = require('../models/Author');

exports.index = async (req, res) => {
  try {
    const { genre, search } = req.query;
    let filter = {};
    if (genre)  filter.genre = genre;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const books   = await Book.find(filter).populate('author', 'name').sort({ title: 1 });
    const authors = await Author.find().sort({ name: 1 });
    res.render('books/index', { title: 'Books', books, authors, genre, search });
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};

exports.newForm = async (req, res) => {
  const authors = await Author.find().sort({ name: 1 });
  res.render('books/new', { title: 'Add Book', authors, error: null });
};

exports.create = async (req, res) => {
  try {
    const { title, author, isbn, genre, publishedYear, totalCopies, description, coverColor } = req.body;
    const book = await Book.create({
      title, author,
      isbn: isbn || undefined,
      genre, publishedYear,
      totalCopies,
      availableCopies: totalCopies,
      description, coverColor
    });
    res.redirect(`/books/${book._id}`);
  } catch (err) {
    const authors = await Author.find().sort({ name: 1 });
    res.render('books/new', { title: 'Add Book', authors, error: err.message });
  }
};

exports.show = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author');
    if (!book) return res.status(404).render('error', { title: '404', message: 'Book not found', currentUser: req.user });
    res.render('books/show', { title: book.title, book });
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};

exports.editForm = async (req, res) => {
  try {
    const book    = await Book.findById(req.params.id);
    const authors = await Author.find().sort({ name: 1 });
    if (!book) return res.status(404).render('error', { title: '404', message: 'Book not found', currentUser: req.user });
    res.render('books/edit', { title: 'Edit Book', book, authors, error: null });
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, author, isbn, genre, publishedYear, totalCopies, description, coverColor } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).render('error', { title: '404', message: 'Book not found', currentUser: req.user });

    const diff = Number(totalCopies) - book.totalCopies;
    book.title         = title;
    book.author        = author;
    book.isbn          = isbn || undefined;
    book.genre         = genre;
    book.publishedYear = publishedYear;
    book.totalCopies   = totalCopies;
    book.availableCopies = Math.max(0, book.availableCopies + diff);
    book.description   = description;
    book.coverColor    = coverColor;
    await book.save();
    res.redirect(`/books/${book._id}`);
  } catch (err) {
    const authors = await Author.find().sort({ name: 1 });
    const book    = await Book.findById(req.params.id);
    res.render('books/edit', { title: 'Edit Book', book, authors, error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.redirect('/books');
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};
