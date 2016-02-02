var application_root = __dirname,
  mongoose = require('mongoose'),
  express = require("express"),
  http = require("http"),
  path = require("path"),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  logger = require('morgan'),
  schemas = require('./schemas.js'),
  socketio = require('socket.io'),
  _ = require('lodash'),
  multer = require('multer');

var app = express();

var storage = multer.diskStorage({
  destination: "./../public/uploads/",
  filename: function (req, file, cb) {
    cb(null, Date.now() +"-"+ file.originalname);
  }
});
var upload = multer({ storage: storage });

var databaseUrl = "mongodb://127.0.0.1:27017/";
var database = "stickywall_development";
var db = mongoose.connect(databaseUrl+database);

app.use(logger('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.use(express.static(path.join(application_root, "/../public")));

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

app.use( function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  next();
});

/**
 * REST API
 */
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
      res.status(500).json({ error: 'Wall with id ['+req.params.id+'] can\'t be fetched' });
    }
  });
});

app.get('/api/newwall', function (req, res) {
  var newWall = new Wall({name: "New Wall", postits: []});
  newWall.save(function (err) {
    if (err)
      res.status(500).json({ message: 'Request is malformed' });
    else
      res.status(200).json({ message: 'Wall have been created', wall: newWall });
  }, this);
});

app.get('/api/walls/', function (req, res) {
  Wall.find(function(err, results) {
    res.status(200).json(results);
  });
});

app.post('/api/file', upload.array('file'), function (req, res, next) {
  console.log("received " + req.files.length + " files");// form files
  for(var i=0; i < req.files.length; i++) {
    console.log("### " + req.files[i].path);
  }

  res.status(200).json({url: "uploads/"+req.files[0].filename});
});

app.listen(8000);

/**
 * Sockets API
 */
var ioServer = socketio(8001);

ioServer.on('connection', function (socket) {
  var connectedClients = [];

  socket.on('register_wall', function (data) {
    var wallId = data.wallId;
    socket.join(wallId);
    console.log('Client '+socket.id+' associated to wall '+ wallId);
    socket.emit('wall_registered');
  });

  socket.on('update_postit_content', function (postitUpdate) {
    // get the id of the wall of the client
    var wallId = _.values(socket.rooms)[1];

    if(wallId) {
      // update post-it in the wall of client
      Wall.findOne({_id: wallId}, function(err, result) {
        if(result) {
          var wall = result;
          _.forEach(wall.postits, function(postit, id) {
            if (id === postitUpdate.id) {
              postit.content = postitUpdate.content;
              postitUpdate.postit = postit;
            }
          }, this);
          Wall.update({_id: wall.id}, { $set: { postits: wall.postits }}, function(err) {
            if (err)
              postitUpdate.status = 'ERROR: Wall not saved';
            else {
              postitUpdate.status = 'SUCCESS: Wall saved successfully';
              socket.to(wallId).emit('postit_updated', postitUpdate);
            }
          }, this);
        }
      });
    } else {
      socket.emit('action_error', {message: 'No wall registered'});
    }
  });

  socket.on('update_postit_position', function (postitUpdate) {
    // get the id of the wall of the client
    var wallId = _.values(socket.rooms)[1];

    if(wallId) {
      // update post-it in the wall of client
      Wall.findOne({_id: wallId}, function(err, result) {
        if(result) {
          var wall = result;
          _.forEach(wall.postits, function(postit, id) {
            if (id === postitUpdate.id) {
              postit.position.x = postitUpdate.position.x;
              postit.position.y = postitUpdate.position.y;
              postitUpdate.postit = postit;
            }
          }, this);
          Wall.update({_id: wall.id}, { $set: { postits: wall.postits }}, function(err) {
            if (err)
              postitUpdate.status = 'ERROR: Wall not saved';
            else {
              postitUpdate.status = 'SUCCESS: Wall saved successfully';
              socket.to(wallId).emit('postit_updated', postitUpdate);
            }
          }, this);
        }
      });
    } else {
      socket.emit('action_error', {message: 'No wall registered'});
    }
  });

  socket.on('new_postit', function (postitAdded) {
    // get the id of the wall of the client
    var wallId = _.values(socket.rooms)[1];

    if(wallId) {
      // update post-it in the wall of client
      Wall.findOne({_id: wallId}, function(err, result) {
        // add post-it in the wall
        result.postits.push(postitAdded);
        result.save(function(err) {
          if (err)
            postitAdded.status = 'ERROR: Wall not saved';
          else {
            postitAdded.status = 'SUCCESS: Wall saved successfully';
            socket.emit('postit_added', postitAdded);
            socket.to(wallId).emit('postit_added', postitAdded);
          }
        }, this);
      });
    } else {
      socket.emit('action_error', {message: 'No wall registered'});
    }
  });

  socket.on('delete_postit', function (postitRemoved) {
    // get the id of the wall of the client
    var wallId = _.values(socket.rooms)[1];

    if(wallId) {
      // update post-it in the wall of client
      Wall.findOne({_id: wallId}, function(err, result) {
        // add post-it in the wall
        _.pullAt(result.postits, [postitRemoved.id]);
        Wall.update({_id: result.id}, { $set: { postits: result.postits }}, function(err) {
          if (err)
            postitRemoved.status = 'ERROR: Wall not saved';
          else {
            postitRemoved.status = 'SUCCESS: Wall saved successfully';
            socket.emit('postit_removed', postitRemoved);
            socket.to(wallId).emit('postit_removed', postitRemoved);
          }
        }, this);
      });
    } else {
      socket.emit('action_error', {message: 'No wall registered'});
    }
  });

  socket.on('disconnect', function() {
    console.log('Client '+socket.id+' disconnected');
  });
});