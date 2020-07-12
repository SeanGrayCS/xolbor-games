'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var messageSchema = Schema( {
  username: String,
  room: String,
  message: String,
  recipientType: String,
  recipient: String,
  date: String,
  dateMili: Number
} );

module.exports = mongoose.model("ChatMessageTeam2", messageSchema);