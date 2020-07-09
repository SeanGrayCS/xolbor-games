'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var quizSchema = Schema( {
  username: String,
  numCorrect: String,
  totalQ: String,
  percent: String,
  date: Date
} );

module.exports = mongoose.model("QuizSubmissionTeam2", quizSchema);