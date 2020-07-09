'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var postSchema = Schema( {
  username: String,
  topic: String,
  message: String,
  date: Date
} );

module.exports = mongoose.model("ForumPostTeam2", postSchema);

