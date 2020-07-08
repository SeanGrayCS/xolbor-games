'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var dataSchema = Schema( {
  game: String,
  rating: String,
  wouldRecommend: String,
  improvement: String,
  additionalComments: String
} );

var SurveyData = mongoose.model("SurveyData", dataSchema);