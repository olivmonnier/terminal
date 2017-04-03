var fs = require('fs');
var spawn = require('child_process').spawn;
var ansi_up = require('ansi_up');
var _ = require('lodash');

module.exports = function(cmd, io) {
  var cmdSplitted = cmd.split(' ');
  var child = spawn(cmd, { shell: true });
  var date = new Date();
  var data = { type: 'response', data: cmd, date: date.toUTCString(), id: child.pid };

  HISTORY.push(data);
  PROCESS.push({ id: child.pid, data: cmd });
  io.emit('response', data);

  if (cmdSplitted[0] === 'cd' && cmdSplitted[1]) {
    process.chdir(cmdSplitted[1]);
  } else if (cmdSplitted[0] === 'cls' || cmdSplitted[0] === 'clear') {
    io.emit('clear');
    HISTORY = new Array();
  } else if (cmdSplitted[0] === 'edit') {
    var fileContent = fs.readFileSync(cmdSplitted[1], 'utf8');

    io.emit('fileEdit', { data: fileContent });
  }

  // Listen for any response from the child:
  child.stdout.on('data', function(data) {
    var date = new Date();
    var data = { type: 'response', data: formatData(data), date: date.toUTCString() };

    io.emit('response', data);
    HISTORY.push(data);
  });

  // Listen for any errors:
  child.stderr.on('data', function(data) {
    var date = new Date();
    var data = { type: 'error', data: formatData(data), date: date.toUTCString() };

    io.emit('error', data);
    HISTORY.push(data);
  });

  // Listen for an exit event:
  child.on('exit', function(exitCode) {
    var date = new Date();
    var data = { type: 'exit', data: exitCode, date: date.toUTCString(), id: child.pid };

    io.emit('exit', data);
    HISTORY.push(data);
    _.remove(PROCESS, function(n) {
      return n.id = child.pid;
    });
  });
}

function formatData(data) {
  return ansi_up.ansi_to_html(data.toString('utf8'));
}
