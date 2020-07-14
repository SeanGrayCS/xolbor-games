'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

//var userSchema = mongoose.Schema( {any:{}})

var userSchema = Schema( {
  googleid: String,
  googletoken: String,
  googlename:String,
  googleemail:String,

  username: String,
  passphrase: String,
  email: String,
  admin: Boolean
});

module.exports = mongoose.model( 'UserTeam2', userSchema );