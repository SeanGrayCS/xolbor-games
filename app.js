/*
  app.js -- This creates an Express webserver
*/

// First we load in all of the packages we need for the server...
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const debug = require("debug")("personalapp:server");

// connect to a database
const mongoose = require( 'mongoose' );
const mongodb_URI = process.env.MONGODB_URI // was 'mongodb://localhost/hsad'
mongoose.connect( mongodb_URI, { useNewUrlParser: true } );
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {console.log("we are connected!!!")});

const isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  }
  else res.redirect('/login')
}


// Now we create the server
const app = express();

//Here we set the ports to use
const port = "3000";
app.set("port", port);

// and now we startup the server listening on that port
const http = require("http");
const server = http.createServer(app);

server.listen(port);

const io = require("socket.io")(server);

// Here we specify that we will be using EJS as our view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Here we process the requests so they are easy to handle
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Here we specify that static files will be in the public folder
app.use(express.static(path.join(__dirname, "public")));

// Here we enable session handling ..
app.use(
  session({
    secret: "zzbbyanana789sdfa",
    resave: false,
    saveUninitialized: false
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
	
const auth = require('./routes/auth')  // added by TJH
app.use(auth)


// This is an example of middleware
// where we look at a request and process it!
app.use(function(req, res, next) {
  //console.log("about to look for routes!!! "+new Date())
  console.log(`${req.method} ${req.url}`);
  //console.dir(req.headers)
  next();
});

// here we start handling routes
app.get("/", (req, res, next) => {  
  res.render("index", { title: "Xolbor Gamez" });
});

app.get("/games", (req, res, next) => {
  res.render("games")
})

app.get("/find-the-number", (req, res) => {
  res.render("find-the-number");
});

app.get("/mafia", async (req, res, next) => {
  try {
    var tenMinAgo = new Date();
    tenMinAgo.setTime(tenMinAgo.getTime() - 600000);
    var mili = tenMinAgo.getTime();
    res.locals.chats = await ChatMessage.find({room:"mafia", recipientType:"Everyone", dateMili:{$gte:mili}}, {_id:0}).sort({date:-1}); 
    res.render("mafia")
  } catch (e) {
    next(e);
  }
});

app.get("/quiz", (req, res) => {
  res.render("quiz");
})

app.get("/post-game-survey", (req, res) => {
  res.render("post-game-survey");
});

app.get("/chat-room", async (req, res, next) => {
  try {
    var tenMinAgo = new Date();
    tenMinAgo.setTime(tenMinAgo.getTime() - 600000);
    var mili = tenMinAgo.getTime();
    res.locals.chats = await ChatMessage.find({room:"chatroom", dateMili:{$gte:mili}}, {_id:0}).sort({date:1});
    res.render("chat-room")
  } catch (e) {
    next(e);
  }
})

const ChatMessage = require('./models/ChatMessage');

io.on('connection', (socket) => {
  socket.on('chat message', async (msg) => {
    const recipientType = msg.recipientType || "Everyone"
    const recipient = msg.recipient || ""
    const date = new Date(msg.date);
    const dateMili = date.getTime();
    const chat = new ChatMessage({username:msg.user, room:msg.room, message:msg.msg, recipientType:recipientType, recipient:recipient, date:msg.date, dateMili:dateMili});
    await chat.save();
    io.emit('chat message', msg);
  });
});

const SurveyData = require('./models/SurveyData');

app.post("/saveformdata", async (req, res, next) => {
  try {
    req.body.date = new Date()
    req.body.username = res.locals.username || "Guest";
    const {game, rating, wouldRecommend, improvement, comments, date, username} = req.body;
    const survey = new SurveyData({username, game, rating, wouldRecommend, improvement, comments, date});
    await survey.save();
    res.redirect("/");
  } catch (e) {
    next(e);
  }
});

app.get("/showformdata", async (req, res, next) => {
  try {
    res.locals.surveys = await SurveyData.find().sort({date:-1})
    res.render("showformdata");
  } catch (e) {
    next(e);
  }    
})

const ForumPost = require('./models/ForumPost')

app.get('/forum', async (req, res, next) => {
  try {
    res.locals.posts = await ForumPost.find().sort({date:-1})
    res.render("forum");
  } catch (e) {
    next(e);
  }
})

app.post("/addToForum", async (req, res, next) => {
  try {
    req.body.date = new Date();
    req.body.username = res.locals.username || "Guest"
    const {topic, message, date, username} = req.body;
    const forumPost = new ForumPost({username, topic, message, date});
    await forumPost.save();
    res.redirect("/forum")
  } catch (e) {
    next(e);
  }
})

app.post('/removePost', async (req, res, next) => {
  try {
    await ForumPost.remove({_id:req.body.id})
    res.redirect('/forum')
  } catch(e) {
    next(e)
  }
})

const QuizSubmission = require('./models/QuizSubmission')

app.get("/quiz-results", async (req, res, next) => {
  try {
    res.locals.quizzes = await QuizSubmission.find().sort({percent:-1}).limit(100)
    res.render("quiz-results");
  } catch (e) {
    next(e);
  }
})

app.post("/submitQuiz", async (req, res, next) => {
  try {
    const key = require('./models/createQuizKey')
    var length = Object.keys(key).length;
    var numWrong = 0;    
    for (var x in key) {
      if (req.body[x] != key[x]) {
        numWrong++;
      }
    }
    const numCorrect = length - numWrong;
    const totalQ = length;
    const percent = (numCorrect / totalQ);
    const date = new Date();
    const username = res.locals.username || "Guest";
    
    const quiz = new QuizSubmission({username, numCorrect, totalQ, percent, date});
    await quiz.save();
    res.redirect("/quiz-results");
  } catch (e) {
    next(e);
  }
})

app.get('/startGame', (req, res) => {
  res.render("startGame")
})

let games = []
app.post('/createGame', (req, res) => {
  const gameInfo = req.body
  games = games.concat(gameInfo)
  res.locals.games = games
  res.render('showGames')
})

const User = require('./models/User')

app.get('/showUsers',
       async (req ,res, next) => {
  try{
    res.locals.users = await User.find()
    res.render('showUsers')
  } catch(error){
    next(error)
  }
})

app.get('/profile', (req, res) => {
  res.locals.userId = null
  res.locals.user = null
  res.render('profile')
})

app.get('/profile/:username', async (req, res, next) => {
  try {
    const username = req.params.username
    res.locals.name = username
    res.locals.user = await User.findOne({username:username})
    res.render('profile')
  } catch(e) {
    next(e)
  }
})

app.get('/admin', (req, res) => {
  res.render('admin')
})

app.post('/makeAdmin', async (req, res, next) => {
  try {
    await User.update({_id:req.body.id}, {$set:{admin:true}})
    res.redirect('/admin')
  } catch(e) {
    next(e)
  }
})

app.post('/removeAdmin', async (req, res, next) => {
  try {
    if (req.body.id != "5f0b47f97a107307a986b1c1") {
    await User.update({_id:req.body.id}, {$set:{admin:false}})
    }
    res.redirect('/admin')
  } catch(e) {
    next(e)
  }
})

app.post('/removeUser', async (req, res, next) => {
  try {
    if (req.body.id != "5f0b47f97a107307a986b1c1") {
      await User.remove({_id:req.body.id})
    }
    res.redirect('/admin')
  } catch(e) {
    next(e)
  }
})

/*
let findNumberLeader = [];

app.post('/logToLeader', (req, res) => {
  req.body.date = new Date()
  req.body.username = res.locals.username
  if (req.body.username === null) {
    req.body.username = "Guest";
  }
  findNumberLeader = findNumberLeader.concat(req.body)
  res.locals.leaders = findNumberLeader
  res.redirect('/find-the-number')
});
*/


// Don't change anything below here ...

// here we catch 404 errors and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// this processes any errors generated by the previous routes
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

server.on("error", onError);

server.on("listening", onListening);

module.exports = app;
