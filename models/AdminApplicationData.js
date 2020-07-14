'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var dataSchema = Schema( {
  username: String,
  age: Number,
  experience: String,
  offer: String,
  want: String,
  rate: String,
  trait: String,
  change: String,
  responsibilities: String,
  date: String
} );

module.exports = mongoose.model("AdminApplicationDataTeam2", dataSchema);