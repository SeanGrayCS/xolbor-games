'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

//var userSchema = mongoose.Schema( {any:{}})

var gameAnswerSchema = Schema( {
  gamePIN: String,
  role: String,
  target: String,
});

module.exports = mongoose.model( 'GameAnswerMafia', gameAnswerSchema );