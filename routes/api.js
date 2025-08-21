'use strict';
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

module.exports = function (app) {
  const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    comments: { type: [String], default: [] }
  });

  const Book = mongoose.model('Book', bookSchema);

  // POST /api/books
  app.post('/api/books', async (req, res) => {
    const { title } = req.body;
    if (!title) return res.send('missing required field title');

    try {
      const newBook = await Book.create({ title });
      res.json({ _id: newBook._id, title: newBook.title });
    } catch (err) {
      res.status(500).send('There was an error saving the book.');
    }
  });

  // GET /api/books
  app.get('/api/books', async (req, res) => {
    try {
      const books = await Book.find({});
      res.json(books.map(b => ({
        _id: b._id,
        title: b.title,
        commentcount: b.comments.length
      })));
    } catch (err) {
      res.status(500).send('Error fetching books');
    }
  });

  // GET /api/books/:id
  app.get('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.send('no book exists');

    try {
      const book = await Book.findById(id);
      if (!book) return res.send('no book exists');
      res.json({ _id: book._id, title: book.title, comments: book.comments });
    } catch (err) {
      res.status(500).send('Error fetching book');
    }
  });

  // POST /api/books/:id (add comment)
  app.post('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment) return res.send('missing required field comment');
    if (!ObjectId.isValid(id)) return res.send('no book exists');

    try {
      const book = await Book.findById(id);
      if (!book) return res.send('no book exists');

      book.comments.push(comment);
      await book.save();

      res.json({ _id: book._id, title: book.title, comments: book.comments });
    } catch (err) {
      res.status(500).send('Error adding comment');
    }
  });

  // DELETE /api/books/:id
  app.delete('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.send('no book exists');

    try {
      const deleted = await Book.findByIdAndDelete(id);
      if (!deleted) return res.send('no book exists');
      res.send('delete successful');
    } catch (err) {
      res.status(500).send('Error deleting book');
    }
  });

  // DELETE /api/books (delete all books)
  app.delete('/api/books', async (req, res) => {
    try {
      await Book.deleteMany({});
      res.send('complete delete successful');
    } catch (err) {
      res.status(500).send('Error deleting all books');
    }
  });
};
