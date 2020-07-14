'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var leaderSchema = Schema({
  username: String,
  number: String,
  numGuesses: String,
  date: String
});

module.exports = mongoose.model("FindNumberLeaderTeam2", leaderSchema);