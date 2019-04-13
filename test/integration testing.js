'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABATE_URL} = require('../server');

chai.use(chaiHttp);

function seedBlogPosts(){
    console.info('seeding blog post data');
    const seedData = [];

    for (let i = 1; i<=10; i++) {
        seedData.push(generateBlogData());
    }
    return BlogPost.insertMany(seedData);
}

function generateTitletitle() {
    const titles =[ 'blah', 'blahBlah', 'blahBlahBlah', 'whatever'];
    return titles[Math.floor(Math.random() * titles.length)];
}

function generateAuthor() {
    const authors = ['jane doe', 'john doe'];
    return authors[Math.floor(Math.random() * authors.length)];
}

function generateContent() {
    const content =['yeet', 'yoink', 'RIP', 'GG', 'Kappa'];
    return content[Mathh.floor(Math.random() * constent.length)];
}

function generateBlogData() {
    return {
        title: generateTitletitle(),
        author: generateAuthor(),
        content: generateContent()
    };
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe(' Blog API resource?', function() {
    before(function() {
        return runServer(TEST_DATABATE_URL);
    });

    beforeEach(function() {
        return seedBlogPosts();
    });

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });

    describe('GET endpoint', function() {
        it('should return all existing blogs', function() {
            let res;
            return chai.request(app)
              .get('/posts')
              .then(function(_res) {
                  res = _res;
                  expect(res).to.have.status(200);
                  expect(res.body.BlogPost).to.have.lengthOf.at.least(1);
                  return BlogPost.count();
              })
              .then(function(count) {
                  expect(res.body.BlogPost).to.have.lengthOf(count)
              });
        });

        it('should return the correct fields', function() {
            let resBlogPost;
            return chai.request(app)
              .get('/posts')
              .then(function(res) {
                  expect(res).to.have.status(200);
                  expect(res).to.be.json;
                  expect(res.body.BlogPosts).to.be.a('array');
                  expect(res.body.BlogPosts).to.have.lengthOf.at.least(1);

                  res.body.BlogPost.forEach(function() {
                      expect(BlogPost).to.be.a('object');
                      expect(BlogPost).to.include.keys('id', 'title', 'author', 'content', 'created');
                  });
                  resBlogPosts = res.body.BlogPosts[0];
                  return BlogPost.findById(resBlogPost.id);
              })
              .then(function(BlogPost) {
                  expect(resBlogPost.id).to.equal(BlogPost.id);
                  expect(resBlogpost.title).to.equal(BlogPost.title);
                  expect(resBlogPost.author).to.equal(BlogPost.author);
                  expect(resBlogPost.content).to.equal(BlogPost.content);
                  expect(resBlogPost.created).to.equal(BlogPost.created);
              });
        });
    });

    describe('POST endpoint', function() {
        it('should add a new post', function() {
            const newPost = generateBlogPostData();

            return chai.request(app)
              .post('/posts')
              .send(newPost)
              .then(function(res) {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.include.keys(
                    'id', 'title', 'author', 'content', 'created');
                expect(res.body.title).to.equal(newPost.title);
                expect(res.body.id).to.not.be.null;
                expect(res.body.author).to.equal(newPost.author);
                expect(res.body.created).to.equal(newPost.created);
                return BlogPost.findById(res.body.id);
              })
              .then(function(BlogPost) {
                expect(BlogPost.title).to.equal(newBlogPost.title);
                expect(BlogPost.author).to.equal(newBlogPost.author);
                expect(BlogPost.content).to.equal(newBlogPost.content);
                expect(BlogPost.created).to.equal(newBlogpost.created);
              });
        });
    });
    describe('PUT endpoint', function() {
        it('should update fields you send over', function() {
        const updateData = {
            title: 'REEEEEEEE',
            content: 'ksfjajnsfgjnpaskndfkanmsdfvkasdkfvnm'
        };

        return BlogPost
          .findOne()
          .then(function(BlogPost) {
              updateData.id = BlogPost.id;

              return chai.request(app)
                .put(`/posts/${BlogPost.id}`)
                .send(updateData);
          })
          .then(function(res) { 
              expect(res).to.have.status(204);

              return BlogPost.findById(updateData.id);
          })
          .then(function(BlogPost) {
              expect(BlogPost.title).to.equal(updateData.title);
              expect(BlogPost.content).to.equal(updateData.content);
          });
        });
    });

    describe('DELETE endpoint', function() {
        it('delete a blog post by id', function() {

        let BlogPost;

        return BlogPost
          .findOne()
          .then(function(_BlogPost) {
              BlogPost = _BlogPost;
              return chai.request(app).delete(`/Blogpost/${BlogPost.id}`);
          })
          .then(function(res) {
              expect(res).to.have.status(204);
              return BlogPost.findById(BlogPost.id);
          })
          .then(function(_BlogPost) {
              expect(_BlogPost).to.be.null;
          });
        });
    });
});