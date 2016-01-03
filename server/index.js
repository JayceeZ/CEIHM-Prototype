var application_root = __dirname,
  mongoose = require('mongoose'),
  express = require("express"),
  path = require("path"),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  logger = require('morgan'),
  schemas = require('./schemas.js');

var app = express();

var databaseUrl = "mongodb://127.0.0.1:27017/";
var database = "stickywall_development";
var db = mongoose.connect(databaseUrl+database);

app.use(logger('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.use(express.static(path.join(application_root, "public")));

// Model references
var Wall = mongoose.model('Wall', schemas.wall);

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send('error', {
    message: err.message,
    error: {}
  });
});

app.get('/api', function (req, res) {
  res.send('TODO: create list of API urls');
});

app.get('/api/version', function (req, res) {
  res.send('0.0.1');
});

app.get('/api/wall/:id', function (req, res) {
  Wall.find({_id: req.params.id}, function(err, results) {
    if(results) {
      res.status(200).json(results[0]);
    } else {
      res.status(500).json({ error: 'Wall with id ['+req.params.id+'] can\'t be fetched' })
    }
  });
});

app.update('/api/wall/:id', function(req, res) {
  Wall.find({_id: req.params.id}, function(err, results) {
    if(results) {
      var wall = results[0];
      res.status(200).json(results[0]);
    } else {
      res.status(500).json({ error: 'Wall with id ['+req.params.id+'] can\'t be fetched' })
    }
  });
});

app.get('/api/walls/', function (req, res) {
  Wall.find(function(err, results) {
    res.status(200).json(results);
  });
});

app.put('/api/wall/new', function (req, res) {
  if(!req.accepts('application/json'))
    return;
  var reqJson = req.body;

  var name = reqJson.name;
  var postits = reqJson.postits;

  var newWall = new Wall({name: name, postits: postits});
  newWall.save(function (err) {
    if (err)
      res.status(500).json({ message: 'Request is malformed' });
    else
      res.status(200).json({ message: 'Wall have been created', wall: newWall });
  }, this);
});

// Launch server
app.listen(8000);