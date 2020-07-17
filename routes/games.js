const express = require('express');
const router = express.Router();
const axios = require('axios')

const GameState = require('../models/GameState')
const GameAnswer = require('../models/GameAnswer')

const loggedIn = (req,res,next) => {
  if (res.locals.user) {
    next()
  } else {
    res.redirect('/login')
  }
}

router.post('/startGame', loggedIn, async (req,res,next) => {
  try{
    const gamePIN = Math.round(10000000*Math.random())
    const gameState = new GameState({
            gamePIN:gamePIN,
            status:'start',
            owner:res.locals.user._id,
            players:[res.locals.user.username],
            playerIds:[res.locals.user._id],
            mafia:0,
            detective:0,
            healer:0
            })
    await gameState.save()
    res.redirect('/gameLobby/' + gamePIN)
  } catch (e) {
    next(e);
  }
})

router.get('/gameLobby/:gamePIN', loggedIn, async (req, res, next) => {
  try {
    const gamePIN = req.params.gamePIN
    res.locals.gamePIN = gamePIN
    const gameState = await GameState.findOne({gamePIN:gamePIN})
    res.locals.state = gameState
    res.locals.isHost = (gameState.owner == res.locals.user._id)
    res.render('gameLobby')
  } catch (e) {
    next(e);
  }
})

router.get('/playGame', loggedIn, (req, res, next) => {
  res.render('gameJoin');
})

router.post('/playGame', loggedIn, (req, res, next) => {
  res.redirect('/playGame');
})

router.get('/started', (req, res) => {
  res.render('started');
})

router.post('/kickPlayer', async (req, res, next) => {
  try {
    const gameState = await GameState.findOne({gamePIN:req.body.gamePIN})
    const players = gameState.players.splice(gameState.playerIds.indexOf(req.body.id), 1)
    const playerIds = gameState.playerIds.splice(gameState.playerIds.indexOf(req.body.id), 1)
    await GameState.update({gamePIN:req.body.gamePIN}, {players:players}, {playerIds:playerIds})
  } catch(e) {
    next(e)
  }
})

router.post('/joinGame', loggedIn, async (req, res, next) => {
  try {
    const gamePIN = req.body.gamePIN
    const gameState = await GameState.findOne({gamePIN:gamePIN})
    if (gameState.status == 'start') {
      res.redirect('/gameLobby/' + gamePIN)
    } else {
      res.redirect('/started')
    }
  } catch (e) {
    next(e);
  }
})

router.get('/playingGame/:gamePIN', loggedIn, async (req, res, next) => {
  try {
    const gamePIN = req.params.gamePIN
    const gameState = await GameState.findOne({gamePIN:gamePIN})
    await GameState.update({gamePIN:gamePIN}, {status:'playing'})
    var players = gameState.players
    var len = players.length - 1;
    var mafia = 0;
    var detective = 0;
    var healer = 0;
    mafia = Math.floor(Math.random() * len);
    len--;
    detective = Math.floor(Math.random() * len);
    if (detective == mafia) {
      detective = len + 1;
    }
    len--;
    healer = Math.floor(Math.random() * len);
    if (healer == detective || healer == mafia) {
      healer = len + 2;
    }
    if (healer == detective || healer == mafia) {
      healer = len + 1;
    }
    await GameState.update({gamePIN:gamePIN}, {mafia:mafia, detective:detective, healer:healer})
    res.redirect("/doNight/" + gamePIN)
  } catch (e) {
    next(e);
  }
})

router.get("/doNight/:gamePIN", loggedIn, async (req, res, next) => {
  try {
    const gamePIN = req.params.gamePIN
    res.locals.gamePIN = gamePIN
    const gameState = await GameState.findOne({gamePIN:gamePIN})
    res.locals.isHost = (gameState.owner == res.locals.user._id)
    res.locals.players = gameState.players
    res.locals.playerIds = gameState.playerIds
    res.locals.mafia = gameState.mafia;
    res.locals.detective = gameState.detective;
    res.locals.healer = gameState.healer;
    res.locals.dead = gameState.dead;
    var isDead = false
    for (var i = 0; i < gameState.dead.length; i++) {
      if (gameState.dead[i] == res.locals.user.username) {
        isDead = true
      }
    }
    res.locals.isDead = isDead
    var mafiaIsDead = false
    for (var i = 0; i < gameState.dead.length; i++) {
      if (gameState.dead[i] == gameState.players[gameState.mafia]) {
        mafiaIsDead = true
      }
    }
    var detectiveIsDead = false
    for (var i = 0; i < gameState.dead.length; i++) {
      if (gameState.dead[i] == gameState.players[gameState.detective]) {
        detectiveIsDead = true
      }
    }
    if (detectiveIsDead) {
      res.locals.winner = "Mafia"
      res.render("gameOver")
    }
    if (mafiaIsDead) {
      res.locals.winner = "Detective"
      res.render("gameOver")
    }
    if ((gameState.players.length - gameState.dead.length) < 3) {
      res.locals.winner = "Mafia"
      res.render("gameOver")
    }
    res.render("doNight")
  } catch (e) {
    next(e);
  }
})

router.get("/endGame/:gamePin", loggedIn, async (req,res,next) => {
  try{
    const gamePIN = req.params.gamePIN
    await GameAnswer.deleteMany({gamePIN:gamePIN})
    res.redirect('/mafia')
  } catch(error) {
    next(error)
  }
})

router.get("/showGameAnswers", async (req,res,next) => {
  try {
    const answers = await GameAnswer.find()
    res.json(answers)
  } catch(error) { 
    next(error)
  }
})

router.get("/showGameStates", async (req,res,next) => {
  try {
    const results = await GameState.find()
    res.json(results)
  } catch(error) {
    next(error)
  }
})

module.exports = router