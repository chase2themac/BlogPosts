'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedBlogPostData() {
    console.info('seeding blog post data');
    const seedData = [];
    for (let i = 1; i <= 10; i++) {
      seedData.push({
        author: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName()
        },
        title: faker.lorem.sentence(),
        content: faker.lorem.text()
      });
    }
    // this will return a promise
    return BlogPost.insertMany(seedData);
  }

function tearDownDb() {
    return new Promise((resolve, reject) => {
      console.warn('Deleting database');
      mongoose.connection.dropDatabase()
        .then(result => resolve(result))
        .catch(err => reject(err));
    });
  }

describe(' Blog API resource?', function() {
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return seedBlogPostData();
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
                  expect(res.body).to.have.lengthOf.at.least(1);
                  return BlogPost.count();
              })
              .then(function(count) {
                  expect(res.body).to.have.lengthOf(count)
                  
              });
        });

        it('should return the correct fields', function() {
            let resBlogPost;
            return chai.request(app)
              .get('/posts')
              .then(function(res) {
                  expect(res).to.have.status(200);
                  expect(res).to.be.json;
                  expect(res.body).to.be.a('array');
                  expect(res.body).to.have.lengthOf.at.least(1);

                  res.body.forEach(function(BlogPost) {
                      expect(BlogPost).to.be.a('object');
                      expect(BlogPost).to.include.keys('id', 'title', 'content', 'author');
                  });
                  resBlogPost = res.body[0];
                  return BlogPost.findById(resBlogPost.id);
              })
              .then(function(BlogPost) {
                  expect(resBlogPost.title).to.equal(BlogPost.title);
                  expect(resBlogPost.author).to.equal(BlogPost.authorName);
                  expect(resBlogPost.content).to.equal(BlogPost.content);
                  
                  
              });
        });
    });

    describe('POST endpoint', function() {
        it('should add a new post', function() {
            const newPost = {
                title: faker.lorem.sentence(),
                author: {
                  firstName: faker.name.firstName(),
                  lastName: faker.name.lastName(),
                },
                content: faker.lorem.text()
              };

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
                expect(res.body.author).to.equal(`${newPost.author.firstName} ${newPost.author.lastName}`);
                return BlogPost.findById(res.body.id);
              })
              .then(function(BlogPost) {
                expect(BlogPost.title).to.equal(newPost.title);
                expect(BlogPost.author.firstName).to.equal(newPost.author.firstName);
                expect(BlogPost.author.lastName).to.equal(newPost.author.lastName);
                expect(BlogPost.content).to.equal(newPost.content);
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

        let BlogPosts;

        return BlogPost
          .findOne()
          .then(function(_BlogPosts) {
              BlogPosts = _BlogPosts;
              return chai.request(app).delete(`/posts/${BlogPosts.id}`);
          })
          .then(function(res) {
              expect(res).to.have.status(204);
              return BlogPost.findById(BlogPosts.id);
          })
          .then(function(_BlogPost) {
              expect(_BlogPost).to.be.null;
              
          });
        });
    });
});