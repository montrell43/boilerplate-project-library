const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server'); // Make sure server.js exports your Express app

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  let testBookId; // Store a book _id to test GET/POST/DELETE by ID

  // POST /api/books with title
  test('POST /api/books with title', function(done) {
    chai.request(server)
      .post('/api/books')
      .send({ title: 'Test Book' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.property(res.body, 'title');
        assert.equal(res.body.title, 'Test Book');
        testBookId = res.body._id;
        done();
      });
  });

  // POST /api/books without title
  test('POST /api/books without title', function(done) {
    chai.request(server)
      .post('/api/books')
      .send({})
      .end(function(err, res) {
        assert.equal(res.text, 'missing required field title');
        done();
      });
  });

  // GET /api/books
  test('GET /api/books', function(done) {
    chai.request(server)
      .get('/api/books')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(book => {
          assert.property(book, '_id');
          assert.property(book, 'title');
          assert.property(book, 'commentcount');
        });
        done();
      });
  });

  // GET /api/books/:id
  test('GET /api/books/:id with valid id', function(done) {
    chai.request(server)
      .get('/api/books/' + testBookId)
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.property(res.body, 'title');
        assert.property(res.body, 'comments');
        assert.equal(res.body._id, testBookId);
        done();
      });
  });

  test('GET /api/books/:id with invalid id', function(done) {
    chai.request(server)
      .get('/api/books/123456789012')
      .end(function(err, res) {
        assert.equal(res.text, 'no book exists');
        done();
      });
  });

  // POST /api/books/:id with comment
  test('POST /api/books/:id with comment', function(done) {
    chai.request(server)
      .post('/api/books/' + testBookId)
      .send({ comment: 'Great book!' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'comments');
        assert.include(res.body.comments, 'Great book!');
        done();
      });
  });

  test('POST /api/books/:id without comment', function(done) {
    chai.request(server)
      .post('/api/books/' + testBookId)
      .send({})
      .end(function(err, res) {
        assert.equal(res.text, 'missing required field comment');
        done();
      });
  });

  test('POST /api/books/:id with invalid id', function(done) {
    chai.request(server)
      .post('/api/books/123456789012')
      .send({ comment: 'Test' })
      .end(function(err, res) {
        assert.equal(res.text, 'no book exists');
        done();
      });
  });

  // DELETE /api/books/:id
  test('DELETE /api/books/:id with valid id', function(done) {
    chai.request(server)
      .delete('/api/books/' + testBookId)
      .end(function(err, res) {
        assert.equal(res.text, 'delete successful');
        done();
      });
  });

  test('DELETE /api/books/:id with invalid id', function(done) {
    chai.request(server)
      .delete('/api/books/123456789012')
      .end(function(err, res) {
        assert.equal(res.text, 'no book exists');
        done();
      });
  });

  // DELETE /api/books (delete all books)
  test('DELETE /api/books', function(done) {
    chai.request(server)
      .delete('/api/books')
      .end(function(err, res) {
        assert.equal(res.text, 'complete delete successful');
        done();
      });
  });

});
