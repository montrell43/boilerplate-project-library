const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// ----- Mongoose Schema -----
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: { type: [String], default: [] }
});

const Book = mongoose.model('Book', bookSchema);

// ----- POST /api/books -----
router.post('/books', async (req, res) => {
  const { title } = req.body;
  if (!title) return res.send('missing required field title');

  try {
    const newBook = await Book.create({ title });
    res.json(newBook);
  } catch (err) {
    res.status(500).send('There was an error saving the book.');
  }
});

// ----- GET /api/books -----
router.get('/books', async (req, res) => {
  try {
    const books = await Book.find({});
    const formatted = books.map(b => ({
      _id: b._id,
      title: b.title,
      commentcount: b.comments.length
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).send('Error retrieving books.');
  }
});

// ----- GET /api/books/:id -----
router.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.send('no book exists');
    res.json(book);
  } catch (err) {
    res.send('no book exists');
  }
});

// ----- POST /api/books/:id (add comment) -----
router.post('/books/:id', async (req, res) => {
  const { comment } = req.body;
  if (!comment) return res.send('missing required field comment');

  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.send('no book exists');

    book.comments.push(comment);
    await book.save();
    res.json(book);
  } catch (err) {
    res.send('no book exists');
  }
});

// ----- DELETE /api/books/:id -----
router.delete('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.send('no book exists');
    res.send('delete successful');
  } catch (err) {
    res.send('no book exists');
  }
});

// ----- DELETE /api/books -----
router.delete('/books', async (req, res) => {
  try {
    await Book.deleteMany({});
    res.send('complete delete successful');
  } catch (err) {
    res.status(500).send('Error deleting books.');
  }
});

module.exports = (app) => {
  app.use('/api', router);
};
