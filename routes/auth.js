var express = require('express');
var router = express.Router();
const crypto = require('crypto')
const User = require('../models/User')


// This is an example of middleware
// where we look at a request and process it!
router.use(function(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
});


router.use((req,res,next) => {
  if (req.session.username) {
    res.locals.loggedIn = true
    res.locals.username = req.session.username
    res.locals.user = req.session.user
    res.locals.email = req.session.email
    res.locals.isAdmin = req.session.admin
  } else {
    res.locals.loggedIn = false
    res.locals.username = null
    res.locals.user = null
    res.locals.email = null
    res.locals.isAdmin = false
  }
  next()
})

var backURL;
var message = "";

router.get("/login", (req,res) => {
  res.locals.message = message
  backURL = req.header('Referer') || '/';
  res.render("login")
})

router.post('/login',
  async (req,res,next) => {
    try {
      const {username,passphrase} = req.body
      const hash = crypto.createHash('sha256');
      hash.update(passphrase);
      const encrypted = hash.digest('hex')
      const user = await User.findOne({username:username,passphrase:encrypted})

      if (user) {
        req.session.username = username //req.body
        req.session.user = user
        req.session.email = user.email
        req.session.admin = user.admin
        res.redirect(backURL)
      } else {
        req.session.username = null
        req.session.user = user
        res.redirect('/login')
      }
    }catch(e){
      next(e)
    }
  })

router.post('/signup',
  async (req,res,next) =>{
    try {
      const {username,passphrase,passphrase2,email} = req.body
      const users = await User.find({username:username})
      const usersEmail = await User.find({email:email})
      if (passphrase != passphrase2){
        message = "Could not Signup: Passphrases must match."
        res.redirect('/login')
      }else if (passphrase.length < 8) {
        message = "Could not Signup: Passphrases must be at least 8 characters."
        res.redirect('/login')
      }else if (!(users === null)) {
        message = "Could not Signup: Username is already taken."
        res.redirect('/login')
      } else if (!(usersEmail === null)) {
        message = "Could not Signup: Email is already being used for a different account."
        res.redirect('/login')
      }else {
        const hash = crypto.createHash('sha256');
        hash.update(passphrase);
        const encrypted = hash.digest('hex')
        const user = new User({username:username,passphrase:encrypted,email:email,admin:false})
        await user.save()
        req.session.username = user.username
        req.session.user = user
        req.session.email = email
        req.session.admin = false
        res.redirect(backURL)
      }
    }catch(e){
      next(e)
    }
  })

router.get('/logout', (req,res) => {
  backURL = req.header('Referer') || '/';
  req.session.destroy()
  res.redirect(backURL);
})

module.exports = router;
