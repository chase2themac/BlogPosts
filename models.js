"use strict";

const mongoose = require("mongoose");

const authorSchema = mongoose.Schema({
  firstName: 'string',
  lastName: 'string',
  userName: {
    type: 'string',
    unique: true
  }
});

const commentSchema = mongoose.Schema({ content: 'string' });

const blogSchema = mongoose.Schema({
  title: 'string',
  content: 'string',
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
  comments: [commentSchema]
});

const Author = mongoose.model('Author', authorSchema);
const BlogPosts = mongoose.model('BlogPost', blogSchema);

blogSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogSchema.pre('findOne', function(next) {
  this.populate('author');
  next();
});

blogSchema.methods.serialize = function(){
  return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.authorName,
    created: this.created
  };
};

BlogPosts
  .findOne({
    title: 'another title'
  })
  .then(blogPost => {
    console.log(blogPost.serialize());
  });

  
module.exports = { BlogPosts, Author};