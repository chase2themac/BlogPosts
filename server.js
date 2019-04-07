"use strict"

const express = require('express');

const morgan = require('morgan');

const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require("./config");

const { BlogPosts } = require("./models");

const { Author } = require('./models');

const app = express();

app.use(morgan('common'));
app.use(express.json());

app.get("/BlogPosts", (req, res) => {
  BlogPosts
    .find()  
    .then(blogposts => {
      res.json(blogposts.map(blogpost => blogpost.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

app.get("/Author", (req, res) => {
  Author.find()  
    .then(authors => {
      res.json(authors.map(author => author.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

app.get("/BlogPosts/:id", (req, res) => {
  BlogPosts
    .findById(req.params.id)
    .then(blogpost => res.json(blogpost.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

app.post("/BlogPosts", (req, res) => {
  const requiredFields = ["title", "content", "author_id"];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  Author
  .findById(req.body.author_id)
  .then(author => {
    if (author) { 
      BlogPosts.create({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author
  })
    .then(blogpost => res.status(201).json(blogpost.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
  }
  else{
    const message = `Author not found`;
    console.error(message);
    return res.status(500).json({ error: 'something went wrong'});
    }
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({ error: `something went wrong`});
  });
});
 

app.post('/Authors', (req, res) => {
  const requiredFields = ['firstName', 'lastName', 'userName'];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  });
  Author
    .findOne({username: req.body.userName})
    .then(author =>{
      if (author) {
        const message = `Username already taken`;
        console.log(message);
        return res.status(400).send(message);
      }
      else{
        Author
        .create({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          userName: req.body.userName
        })
        .then(author => res.status(201).json({
          _id: author.id,
          name: `${author.firstName} ${author.lastName}`,
          userName: author.userName
        }))
        .catch(err =>{
          console.error(err);
          res.status(500).json({ error: 'something went wrong'});
        });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went wrong'});
    });
});

app.put("/BlogPosts/:id", (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message =
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }

  const toUpdate = {};
  const updateableFields = ["title", "content"];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  BlogPosts
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(blogpost => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});
  
app.put('/author/:id', (req,res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: `Request path id and request body id values don't match`
    });
  }
  const updated = {};
  const updateableFields = ['firstName', 'lastName', 'userName'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });
  Author
  .findOne({ userName: updated.userName || '', _id: { $ne: req.params.id}})
  .then(author => {
    if(author) {
    const message = ` Username already taken`;
    console.error(message);
    }
    else {
      Author
      .findByIdAndUpdate(req.params.id, { $set: updated}, {new: true})
      .then(updatedAuthor => {
        res.status(200).json({
          id: updatedAuthor.id,
          name: `${updatedAuthor.firstName} ${updatedAuthor.lastName}`,
          userName: updatedAuthor.userName
        });
      })
      .catch(err => res.status(500).json({ message: err}));
    }
  });
});

app.delete("/Blogposts/:id", (req, res) => {
  BlogPosts.findByIdAndRemove(req.params.id)
    .then(blogpost => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

app.delete('/author/:id', (req, res) => {
  BlogPosts
  .remove({ author: req.params.id})
  .then(() => {
    Author
    .findByIdAndRemove(req.params.id)
    .then(() => {
      console.log(`Deleted blog posts owned by and author with id \`${req.params.id}\``);
      res.status(204).json({ message: 'success'});
    });
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({ error: 'something went wrong'});
  });
});

app.use("*", function(req, res) {
  res.status(404).json({ message: "Not Found" });
});  

  let server;

  function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
      mongoose.connect(
        databaseUrl,
        err => {
          if (err) {
            return reject(err);
          }
          server = app
            .listen(port, () => {
              console.log(`Your app is listening on port ${port}`);
              resolve();
            })
            .on("error", err => {
              mongoose.disconnect();
              reject(err);
            });
        }
      );
    });
  }
  


  function closeServer() {
    return mongoose.disconnect().then(() => {
      return new Promise((resolve, reject) => {
        console.log("Closing server");
        server.close(err => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });
  }

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
