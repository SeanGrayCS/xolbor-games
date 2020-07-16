'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var gameSchema = Schema( {
  gamePIN: String,
  status: String,
  owner: Schema.Types.ObjectId,
  players: [],
  playerIds: [],
  dead: [],
  mafia: Number,
  detective: Number,
  healer: Number
} );

module.exports = mongoose.model( 'GameStateMafia', gameSchema );