const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

const { assert } = chai;
chai.use(chaiHttp); 

suite('Functional Tests', function() {

  let testBookId; // Store a book ID to use in GET/POST/DELETE tests

  // --- POST /api/books ---
  suite('POST /api/books', function() {

    test('Create a book with title', function(done) {
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

    test('Create a book without title', function(done) {
      chai.request(server)
        .post('/api/books')
        .send({})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'missing required field title');
          done();
        });
    });

  });

  // --- GET /api/books ---
  suite('GET /api/books', function() {
    test('Get all books', function(done) {
      chai.request(server)
        .get('/api/books')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          if (res.body.length > 0) {
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'title');
            assert.property(res.body[0], 'commentcount');
          }
          done();
        });
    });
  });

  // --- GET /api/books/:id ---
  suite('GET /api/books/:id', function() {
    test('Get book with invalid id', function(done) {
      chai.request(server)
        .get('/api/books/000000000000000000000000')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no book exists');
          done();
        });
    });

    test('Get book with valid id', function(done) {
      chai.request(server)
        .get('/api/books/' + testBookId)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          assert.property(res.body, 'title');
          assert.property(res.body, 'comments');
          assert.isArray(res.body.comments);
          assert.equal(res.body._id, testBookId);
          done();
        });
    });
  });

  // --- POST /api/books/:id comment ---
  suite('POST /api/books/:id comment', function() {
    test('Add a comment to book', function(done) {
      chai.request(server)
        .post('/api/books/' + testBookId)
        .send({ comment: 'Great book!' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.include(res.body.comments, 'Great book!');
          done();
        });
    });
  });

  // --- DELETE /api/books/:id ---
  suite('DELETE /api/books/:id', function() {
    test('Delete book', function(done) {
      chai.request(server)
        .delete('/api/books/' + testBookId)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'delete successful');
          done();
        });
    });
  });

});
