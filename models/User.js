'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

//var userSchema = mongoose.Schema( {any:{}})

var userSchema = Schema( {
  username: String,
  passphrase: String,
  email: String,
  admin: Boolean
});

module.exports = mongoose.model( 'UserTeam2', userSchema );

/* we should add in that they need an email to sign up */ 