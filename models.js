"use strict";

const mongoose = require("mongoose");

const blogSchema = mongoose.Schema({
  title: { type: String, required: true} ,
  content: { type: String, required: true},
  author: { firstName: String, lastName: String,  required: true},
  publishedDate: {date: Date}
});

blogSchema.virtual("authorString").get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogSchema.method.serialize = function(){
  return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.author,
    publishedDate: this.publishedDate
  };
};

const BlogPosts = mongoose.model("BlogPosts", blogSchema);

module.exports = { BlogPosts};