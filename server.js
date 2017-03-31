var express = require('express');
var app = express();
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(server);
var execSync = require('child_process').execSync;
var child = require('./child');
var isWin = /^win/.test(process.platform);

global.HISTORY = [];
global.PROCESS = [];

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', function(req, res) {
  return res.render('index')
});

app.post('/', function(req, res) {
  var params = req.body;

  child(params.exec, io);

  return res.status(200).send();
});

server.listen(8000);

io.on('connection', function(socket) {
  socket.emit('init', { history: HISTORY, process: PROCESS });
  socket.on('killProcess', function(data) {
    if (isWin) {
      execSync('taskkill /PID ' + data.id + ' /T /F');
    } else {
      process.kill(data.id, 'SIGKILL');
    }
  });
});
