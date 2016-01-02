var application_root = __dirname,
  mongojs = require("mongojs"),
  express = require("express"),
  path = require("path"),
  bodyParser = require('body-parser'),
  multer = require('multer'); // v1.0.5

var app = express();
var upload = multer(); // for parsing multipart/form-data;

var databaseUrl = "127.0.0.1:27017/";
var database = "stickywall_development";
var db = mongojs(databaseUrl+database);

app.use(express.static(path.join(application_root, "public")));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/api', function (req, res) {
  res.send('TODO: create list of API urls');
});

app.get('/api/version', function (req, res) {
  res.send('0.0.1');
});

app.get('/api/wall/:id', function (req, res) {
  var walls = db.collection('walls');
  var wall = walls[req.params.id];
  if(wall) {
    res.status(200).json(wall);
  } else {
    res.status(500).json({ error: 'The wall with id '+req.params.id+' can\'t be fetched' })
  }
});

app.put('/api/wall/:id', upload.array(), function (req, res) {
  var walls = db.collection('walls');
  var wall = walls[req.params.id];
  var newWall = req.body;
  if(wall) {
    res.status(200).json(wall);
  } else {
    res.status(500).json({ error: 'The wall with id '+req.params.id+' can\'t be fetched' })
  }
});

// Launch server
app.listen(8000);