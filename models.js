"use strict";

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const authorSchema = mongoose.Schema({
  firstName: 'string',
  lastName: 'string',
  userName: {
    type: 'string',
    unique: true
  }
});

authorSchema.methods.serialize= function (){
  return {
    id: this._id,
    name: this.authorName,
    userName: this.userName
  };
};

const commentSchema = mongoose.Schema({ content: 'string' });

const blogSchema = mongoose.Schema({
  title: 'string',
  content: 'string',
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'author' },
  comments: [commentSchema]
});

blogSchema.pre('findOne', function(next) {
  this.populate('author');
  next();
});

blogSchema.pre('find', function(next) {
  this.populate('author');
  next();
});

blogSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

authorSchema.virtual('authorName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});


blogSchema.methods.serialize = function(){
  return {
    id: this._id,
    author: this.authorName,
    content: this.content,
    title: this.title,
    comments: this.comments
  };
};


const Author = mongoose.model('author', authorSchema);
const BlogPosts = mongoose.model('blog-post', blogSchema);
  
module.exports = { BlogPosts, Author};