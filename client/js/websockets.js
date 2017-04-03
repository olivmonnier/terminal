(function(io, $) {
  var socket = io.connect('/');

  socket.on('init', function(data) {
    data.history.forEach(function(log) {
      showLog(log);
    });
    data.process.forEach(function(proc) {
      showProcessBadge(proc);
    });
  });
  ['response', 'error', 'exit'].forEach(function(event) {
    socket.on(event, function(data) {
      if (data) showLog(data);
    });
  });

  socket.on('clear', function() {
    $('#logs .shell-body li').remove();
  });

  socket.on('response', function(data) {
    if (data.id) {
      showProcessBadge(data);
    }
  });

  socket.on('exit', function(data) {
    $('[data-process-id="' + data.id + '"]').remove();
  });

  function showLog(log) {
    const $shellBody = $('#logs .shell-body');

    $shellBody
      .find('ul')
      .append('<li>[' + log.date + '] ' + formatTypeLog(log.type) + ' - ' + log.data + '</li>')
      .parent()
      .scrollTop($shellBody[0].scrollHeight);
  }

  function showProcessBadge(process) {
    $('.process-wrap').append('<span class="badge" data-process-id="' + process.id + '">' + process.data + '</span>');
  }

  function formatTypeLog(type) {
    if (type === 'response') {
      return ''
    } else if (type === 'error') {
      return '<span class="color-error">[ERROR]</span>'
    } else if (type === 'exit') {
      return '<span class="color-complete">[exit code]</span>'
    }
  }
}(io, jQuery));
