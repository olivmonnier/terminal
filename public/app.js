var inputsHistory = [];
var indexInputHistorySelected = null;
var socket = io.connect('/');

socket.on('init', function(data) {
  data.forEach(function(log) {
    showLog(log);
  })
});
['response', 'error', 'exit'].forEach(function(event) {
  socket.on(event, function(data) {
    showLog(data);
  });
});

socket.on('clear', function() {
  $('#logs .shell-body li').remove();
});

$(document).ready(function() {
  onShellFormSubmit();
  onShellInputKeydown();
});

function onShellFormSubmit() {
  $(document).on('submit', '#shellForm', function(e) {
    e.preventDefault();

    var cmd = $('[name="exec"]').val();

    inputsHistory.push(cmd);
    indexInputHistorySelected = inputsHistory.length;
    $.post('/', { exec: cmd })
      .done(function() {
        $('[name="exec"]').val('');
      });
  });
}

function onShellInputKeydown() {
  $(document).on('keydown', '#logs [name="exec"]', function (e) {
    if (e.which === 38 || e.which === 40) {
      if (e.which === 38) { //UP
        if (inputsHistory.length >= 0) indexInputHistorySelected -= 1;
      } else if(e.which === 40) { //DOWN
        if (inputsHistory.length >= indexInputHistorySelected + 1) indexInputHistorySelected += 1;
      }

      $('[name="exec"]').val(inputsHistory[indexInputHistorySelected]);
    }
  });
}

function showLog(log) {
  $('#logs .shell-body').append('<li>[' + log.date + '] ' + formatTypeLog(log.type) + ' - ' + log.data + '</li>');
}

function formatTypeLog(type) {
  if (type === 'response') {
    return ''
  } else if (type === 'error') {
    return '[ERROR]'
  } else if (type === 'exit') {
    return '[exit code]'
  }
}
