var spawn = require('child_process').spawn;

module.exports = function(cmd, io) {
  var cmdSplitted = cmd.split(' ');
  var child = spawn(cmd, { shell: true });
  var date = new Date();
  var data = { type: 'response', data: cmd, date: date.toUTCString() };

  HISTORY.push(data);
  io.emit('response', data);

  if (cmdSplitted[0] === 'cd' && cmdSplitted[1]) {
    process.chdir(cmdSplitted[1]);
  } else if (cmdSplitted[0] === 'cls' || cmdSplitted[0] === 'clear') {
    io.emit('clear');
    HISTORY = new Array();
  }

  // Listen for any response from the child:
  child.stdout.on('data', function(data) {
    var date = new Date();
    var data = { type: 'response', data: data.toString('utf8'), date: date.toUTCString() };

    io.emit('response', data);
    HISTORY.push(data);
  });

  // Listen for any errors:
  child.stderr.on('data', function(data) {
    var date = new Date();
    var data = { type: 'error', data: data.toString('utf8'), date: date.toUTCString() };

    io.emit('error', data);
    HISTORY.push(data);
  });

  // Listen for an exit event:
  child.on('exit', function(exitCode) {
    var date = new Date();
    var data = { type: 'exit', data: exitCode, date: date.toUTCString() };

    io.emit('exit', data);
    HISTORY.push(data);
  });
}
