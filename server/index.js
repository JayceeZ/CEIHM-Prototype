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

// Socket server (used in API)
var ioServer = socketio(8001);

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

app.get('/api/wall/:id/markups', function (req, res) {
  Wall.find({isCopy: true, originalWallId: req.params.id}, function(err, results) {
    if(results) {
      res.status(200).json(results);
    } else {
      res.status(500).json({ error: 'Wall with id ['+req.params.id+'] can\'t be fetched' });
    }
  });
});

app.get('/api/newwall', function (req, res) {
  var newWall = new Wall({
      name: "New Wall",
      date: new Date(),
      postits: []
    });
  newWall.save(function (err) {
    if (err)
      res.status(500).json({ message: 'Request is malformed' });
    else
      res.status(200).json({ message: 'Wall have been created', wall: newWall });
  }, this);
});

app.post('/api/wall/:id/markup', function (req, res) {
  Wall.findOne({ _id: req.params.id }, function (err, wallToCopy) {
    if (err)
      res.status(400).json({ message: 'Request is malformed' });
    else {
      if(wallToCopy) {
        // verify if an existing exact copy don't exist
        Wall.findOne({
          isCopy: true,
          originalWallId: wallToCopy._id,
          version: wallToCopy.__v
        }, function(err, existingCopy) {
          if(existingCopy) {
            // lock useless wall copies
            res.status(400).json({message: 'Wall already have an exact copy', copyId: existingCopy._id});
            return;
          }
          var copy = new Wall({
            name: wallToCopy.name,
            postits: wallToCopy.postits,
            version: wallToCopy.__v,
            date: new Date(),
            isCopy: true,
            originalWallId: wallToCopy._id
          });
          copy.save(function(err, wall) {
            if(err)
              res.status(500).json({ message: 'An unexpected error occured: '+err });
            else
              res.status(200).json({message: 'Wall have been copied', copyId: wall._id});
          });
        });
      } else {
        res.status(404).json({message: 'Requested wall does not exist'});
      }
    }
  }, this);
});

app.get('/api/walls', function (req, res) {
  Wall.find(function(err, results) {
    var ret = [];
    _.forEach(results, function(result) {
      if(result.isCopy !== true)
        ret.push(result);
    });
    res.status(200).json({walls: ret});
  });
});

app.post('/api/file', upload.single('file'), function (req, res, next) {
  console.log("File uploaded to " + req.file.path);

  res.status(200).json({url: "uploads/"+req.file.filename});
});

app.post('/api/wall/:id/postit', upload.single('file'), function (req, res, next) {
  console.log("Received a file for postit");// form files
  console.log("File uploaded to " + req.file.path);

  var id = req.params.id;
  var size = { width: Number(req.body.width) || 100, height: Number(req.body.height) || 100};
  console.log(size);
  var newPostit = {
    name: req.file.filename,
    position: {
      x: 200,
      y: 200,
      z: 0
    },
    size: {
      width: size.width,
      height: size.height
    },
    file: "uploads/"+req.file.filename
  };

  Wall.findOne({ _id: id }, function(err, result) {
    if(err)
      res.status(400).json("An error occurred: " + err);
    if(result && !result.isCopy) {
      result.postits.push(newPostit);
      ioServer.sockets.to(id).emit('postit_added', newPostit);
      result.save();
      res.status(200).json("Postit added to wall: " + id);
    } else {
      res.status(404).json("Wall not found");
    }
  });
});

/**
 * Sockets API
 */
ioServer.on('connection', function (socket) {
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
        if(result && !result.isCopy) {
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
        if(result && !result.isCopy) {
          var wall = result;
          _.forEach(wall.postits, function(postit, id) {
            if (id === postitUpdate.id) {
              postit.position.x = postitUpdate.position.x;
              postit.position.y = postitUpdate.position.y;
              postit.position.z = postitUpdate.position.z;
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

  socket.on('update_postit_size', function (postitUpdate) {
    // get the id of the wall of the client
    var wallId = _.values(socket.rooms)[1];

    if(wallId) {
      // update post-it in the wall of client
      Wall.findOne({_id: wallId}, function(err, result) {
        if(result && !result.isCopy) {
          var wall = result;
          _.forEach(wall.postits, function(postit, id) {
            if (id === postitUpdate.id) {
              postit.size.width = postitUpdate.size.width;
              postit.size.height = postitUpdate.size.height;
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
        if(result && !result.isCopy) {
          // add post-it in the wall
          result.postits.push(postitAdded);
          // save the wall
          result.save(function (err) {
            if (err)
              postitAdded.status = 'ERROR: Wall not saved';
            else {
              postitAdded.status = 'SUCCESS: Wall saved successfully';
              socket.emit('postit_added', postitAdded);
              socket.to(wallId).emit('postit_added', postitAdded);
            }
          });
        }
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
        if(result && !result.isCopy) {
          // remove post-it from the wall
          _.pullAt(result.postits, [postitRemoved.id]);
          // save the wall
          Wall.update({_id: result.id}, {$set: {postits: result.postits}}, function (err) {
            if (err)
              postitRemoved.status = 'ERROR: Wall not saved';
            else {
              postitRemoved.status = 'SUCCESS: Wall saved successfully';
              socket.emit('postit_removed', postitRemoved);
              socket.to(wallId).emit('postit_removed', postitRemoved);
            }
          }, this);
        }
      });
    } else {
      socket.emit('action_error', {message: 'No wall registered'});
    }
  });

  socket.on('disconnect', function() {
    console.log('Client '+socket.id+' disconnected');
  });
});

// Start server
app.listen(8000);