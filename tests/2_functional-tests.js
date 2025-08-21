const chaiHttp = require('chai-http');
const chai = require('chai');
const mongoose = require('mongoose');
const server = require('../server');

const { assert } = chai;
chai.use(chaiHttp);

suite('Functional Tests', function() {

  let testBookId;

  before(async function() {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI_TEST);
    }
    await mongoose.connection.dropDatabase();
  });

  after(async function() {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  suite('POST /api/books with title', function() {
    test('Test POST /api/books with title', function(done) {
      chai.request(server)
        .post('/api/books')
        .send({ title: 'Test Book' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          assert.property(res.body, 'title');
          assert.equal(res.body.title, 'Test Book');
          testBookId = res.body._id;
          done();
        });
    });

    test('Test POST /api/books with no title given', function(done) {
      chai.request(server)
        .post('/api/books')
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'missing required field title');
          done();
        });
    });
  });

  suite('GET /api/books', function() {
    test('Test GET /api/books', function(done) {
      chai.request(server)
        .get('/api/books')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'commentcount');
          assert.property(res.body[0], 'title');
          assert.property(res.body[0], '_id');
          done();
        });
    });
  });

  suite('GET /api/books/[id]', function() {
    test('GET /api/books/[id] with invalid id', function(done) {
      chai.request(server)
        .get('/api/books/000000000000000000000000')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no book exists');
          done();
        });
    });

    test('GET /api/books/[id] with valid id', function(done) {
      chai.request(server)
        .get('/api/books/' + testBookId)
        .end((err, res) => {
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

  suite('POST /api/books/[id] => add comment', function() {
    test('POST /api/books/[id] with comment', function(done) {
      chai.request(server)
        .post('/api/books/' + testBookId)
        .send({ comment: 'Great book!' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.include(res.body.comments, 'Great book!');
          done();
        });
    });

    test('POST /api/books/[id] without comment field', function(done) {
      chai.request(server)
        .post('/api/books/' + testBookId)
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'missing required field comment');
          done();
        });
    });

    test('POST /api/books/[id] with invalid id', function(done) {
      chai.request(server)
        .post('/api/books/000000000000000000000000')
        .send({ comment: 'Hello' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no book exists');
          done();
        });
    });
  });

  suite('DELETE /api/books/[id]', function() {
    test('DELETE /api/books/[id] with valid id', function(done) {
      chai.request(server)
        .delete('/api/books/' + testBookId)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'delete successful');
          done();
        });
    });

    test('DELETE /api/books/[id] with invalid id', function(done) {
      chai.request(server)
        .delete('/api/books/000000000000000000000000')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no book exists');
          done();
        });
    });
  });
});
