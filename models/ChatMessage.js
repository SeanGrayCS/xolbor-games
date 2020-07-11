'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var postSchema = Schema( {
  username: String,
  room: String,
  message: String,
  recipientType: String,
  recipient: String,
  date: Date,
  dateMili: Number
} );

module.exports = mongoose.model("ChatPostTeam2", postSchema);