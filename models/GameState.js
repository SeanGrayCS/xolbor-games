'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var schema = Schema( {
  gamePIN: String,
  status: String,
  state: String,
  stage: Number
} );

module.exports = mongoose.model( 'GameStateTeam2', schema );

