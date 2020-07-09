'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var dataSchema = Schema( {
  username: String,
  game: String,
  rating: String,
  wouldRecommend: String,
  improvement: String,
  additionalComments: String,
  date: Date
} );

module.exports = mongoose.model("SurveyDataTeam2", dataSchema);