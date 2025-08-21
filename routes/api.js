'use strict';

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: { type: [String], default: [] },
});

const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {

  // ====== /api/books ======
  app.route('/api/books')
    .get(async (req, res) => {
      try {
        const books = await Book.find({});
        const formattedBooks = books.map(book => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length
        }));
        res.json(formattedBooks);
      } catch (err) {
        res.status(500).send(err.message);
      }
    })
    
    .post(async (req, res) => {
      const title = req.body.title;
      if (!title) return res.send('missing required field title');

      try {
        const newBook = new Book({ title });
        const savedBook = await newBook.save();
        res.json({ _id: savedBook._id, title: savedBook.title });
      } catch (err) {
        res.status(500).send('There was an error saving the book.');
      }
    })
    
    .delete(async (req, res) => {
      try {
        await Book.deleteMany({});
        res.send('complete delete successful');
      } catch (err) {
        res.status(500).send('Error deleting books.');
      }
    });


  // ====== /api/books/:id ======
  app.route('/api/books/:id')
    .get(async (req, res) => {
      const bookid = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(bookid)) return res.send('no book exists');

      try {
        const book = await Book.findById(bookid);
        if (!book) return res.send('no book exists');
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (err) {
        res.send('no book exists');
      }
    })
    
    .post(async (req, res) => {
      const bookid = req.params.id;
      const comment = req.body.comment;

      if (!comment) return res.send('missing required field comment');
      if (!mongoose.Types.ObjectId.isValid(bookid)) return res.send('no book exists');

      try {
        const book = await Book.findById(bookid);
        if (!book) return res.send('no book exists');

        book.comments.push(comment);
        const updatedBook = await book.save();
        res.json({ _id: updatedBook._id, title: updatedBook.title, comments: updatedBook.comments });
      } catch (err) {
        res.send('no book exists');
      }
    })
    
    .delete(async (req, res) => {
      const bookid = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(bookid)) return res.send('no book exists');

      try {
        const book = await Book.findByIdAndDelete(bookid);
        if (!book) return res.send('no book exists');
        res.send('delete successful');
      } catch (err) {
        res.send('no book exists');
      }
    });

};
