'use strict';

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Book = require('../models/book');


module.exports = function(app) {
  
  // ----- Mongoose Book Schema -----
  const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    comments: { type : [String], default: [] }
  });

  // Virtual field for commentcount
  bookSchema.virtual('commentcount').get(function() {
    return this.comments.length;
  });

  bookSchema.set('toJSON', { virtuals: true });

  const Book = mongoose.model('Book', bookSchema);

  // ----- POST /api/books -----
  app.route('/api/books')
    .post(async (req, res) => {
      const { title } = req.body;
      if (!title) return res.send('missing required field title');

      try {
        const book = new Book({ title, comments: [] });
        await book.save();
        res.json({ _id: book._id, title: book.title });
      } catch (err) {
        console.log("Error saving book:", err);
        res.status(500).send('There was an error saving the book.');
      }
    })
    
    // ----- GET /api/books -----
    .get(async (req, res) => {
      try {
        const books = await Book.find({});
        // return _id, title, commentcount only
        const result = books.map(b => ({
          _id: b._id,
          title: b.title,
          commentcount: b.comments.length
        }));
        res.json(result);
      } catch (err) {
        console.error(err)
        res.status(500).send('There was an error fetching books.');
      }
    })
    
    // ----- DELETE /api/books -----
    .delete(async (req, res) => {
      try {
        await Book.deleteMany({});
        res.send('complete delete successful');
      } catch (err) {
        console.error(err);
        res.status(500).send('There was an error deleting books.');
      }
    });

  // ----- Routes with book ID -----
  app.route('/api/books/:id')
    .get(async (req, res) => {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) return res.send('no book exists');

      try {
        const book = await Book.findById(id);
        if (!book) return res.send('no book exists');
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (err) {
        console.log(err);
        res.status(500).send('There was an error fetching the book.');
      }
    })
    .post(async (req, res) => {
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
        console.log(err);
        res.status(500).send('There was an error adding the comment.');
      }
    })
    .delete(async (req, res) => {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) return res.send('no book exists');

      try {
        const book = await Book.findByIdAndDelete(id);
        if (!book) return res.send('no book exists');
        res.send('delete successful');
      } catch (err) {
        console.log(err);
        res.status(500).send('There was an error deleting the book.');
      }
    });

};
