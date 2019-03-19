const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");

const expect = chai.expect;

chai.use(chaiHttp);

describe("blog posts", function() {
    Before(function() {
        return runServer();
    });

    after(function(){
        return closeServer();
    });

    it("should list blog posts", function() {
        return chai
            .request(app)
            .get("/BlogPosts")
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a(array);
                expect(res.body.length).to.be.above(0);

                const expectedKeys = ["id", "title", "content", "author"];
                res.body.forEach(function() {
                    expect(post).to.be.a("object");
                    expect(item).to.include.keys(expectedKeys);
                });
            });
    });

    it("should add a post", function() {
        const newItem = { title: "bruh", content: "have you guys actually used Travis? it is soooooooooooo terribly non user friendly it had nearly broken my spirit", author: "jtc"};
        const expectedKeys = ["id","publishDate"].concat(Object.keys(newItem));
        return chai
          .request(app)
          .post("/BlogPosts")
          .send(newItem)
          .then(function(res) {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a("object");
            expect(res.body).to.include.keys("id", "title", "content", "publishedDate", "author");
            expect(res.body.id).to.not.equal(null);
            expect(res.body.title).to.equal(newPost.title);
            expect(res.body.content).to.equal(newPost.content);
            expect(res.body.author).to.equal(newPost.author);
          });
          });
      
          it("should error if POST missing expected values", function() {
            const badRequestData = {};
            return chai
              .request(app)
              .post("/BlogPosts")
              .send(badRequestData)
              .then(function(res) {
                expect(res).to.have.status(400);
              });
          });
    
      it("should update posts on PUT", function() {
        const updateData = {
          title: "bruh",
          author: "jtc",
          content: "well i guess its good we have mentors"
        };
    
        return (
          chai
            .request(app)
            .get("/BlogPosts")
            .then(function(res) {
              updateData.id = res.body[0].id;
              return chai
                .request(app)
                .put(`/BlogPosts/${updateData.id}`)
                .send(updateData);
            })
            .then(function(res) {
              expect(res).to.have.status(204);
              expect(res).to.be.json;
              expect(res.body).to.be.a("object");
              expect(res.body).to.deep.equal(updateData);
            })
        );
      });
    
      it("should delete the post on DELETE", function() {
        return (
          chai
            .request(app)
            .get("/BlogPosts")
            .then(function(res) {
              return chai.request(app).delete(`/BlogPosts/${res.body[0].id}`);
            })
            .then(function(res) {
              expect(res).to.have.status(204);
            })
        );
      });
    });
    
