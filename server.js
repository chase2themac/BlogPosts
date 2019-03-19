var express = require('express');

const morgan = require('morgan');

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

const app = express();

const {BlogPosts} = require('./models');

const router = express.Router();

app.use(morgan('common'));

BlogPosts.create('O.M.G','I just saw james, and he looks so confused about how this is actually working out XD. it is almost as if he didnt read the stuff, but some how just spaced out as he scrolled through everything. RIP', 'Tyler');

BlogPosts.create('well', 'talked to james again today, and i think he may actually know how it all works without actually knowing how it all works.... that would be crazy huh?','Tyler');

app.get('/BlogPosts', (req, res)=>{
    res.json(BlogPosts.get());
});

app.post('/BlogPosts', jsonParser,(req,res)=>{
    const requiredFields = ['title', 'content', 'author','PublishDate'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
}

const blog = BlogPosts.create(req.body.title, req.body.content, req.body.author, req.body.PublishDate);
  res.status(201).json(blog);
});

app.put('/BlogPosts/:id', jsonParser, (req, res) => {
    const requiredFields = ['title', 'content', 'author','id'];
    for (let i=0; i<requiredFields.length; i++) {
      const field = requiredFields[i];
      if (!(field in req.body)) {
        const message = `Missing \`${field}\` in request body`
        console.error(message);
        return res.status(400).send(message);
      }
    }
  
    if (req.params.id !== req.body.id) {
      const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
      console.error(message);
      return res.status(400).send(message);
    }
    console.log(`Updating blog posts \`${req.params.id}\``);
    BlogPosts.update({
      id: req.params.id,
      title: req.body.title,
      content: req.body.content,
      author: req.body.author
    });
    res.status(204).end();
  });
  
  app.delete('/BlogPosts/:id', (req, res) => {
    BlogPosts.delete(req.params.id);
    console.log(`Deleted Blog post \`${req.params.ID}\``);
    res.status(204).end();
  });

  app.listen(process.env.PORT || 8080, () => {
    console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
  });
  
  let server;

function runServer() {
  const port = process.env.PORT || 8080;
  return new Promise((resolve, reject) => {
    server = app
      .listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve(server);
      })
      .on("error", err => {
        reject(err);
      });
  });
}


function closeServer() {
  return new Promise((resolve, reject) => {
    console.log("Closing server");
    server.close(err => {
      if (err) {
        reject(err);
        
        return;
      }
      resolve();
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
