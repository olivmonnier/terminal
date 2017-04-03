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
      if (data instanceof Error) {
        var date = new Date();

        return showLog({ type: 'error', data, date: date.toUTCString() });
      }
      if (data) showLog(data);
    });
  });

  socket.on('clear', function() {
    $('#App .shell-body li').remove();
  });

  socket.on('response', function(data) {
    if (data.id) {
      showProcessBadge(data);
    }
  });

  socket.on('exit', function(data) {
    $('[data-process-id="' + data.id + '"]').remove();
  });

  socket.on('fileEdit', function(data) {
    Editor.setValue(data.data, -1);
    $('#editor')
      .attr('data-path', data.path)
      .addClass('in');
  });

  function showLog(log) {
    var $shellBody = $('#App .shell-body');

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
