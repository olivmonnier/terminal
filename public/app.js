(function($) {  
  var inputsHistory = [];
  var indexInputHistorySelected = null;

  $(document).ready(function() {
    onSubmitShellForm();
    onKeydownShellInput();
    onClickProcessBadge();
  });

  function onSubmitShellForm() {
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

  function onKeydownShellInput() {
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

  function onClickProcessBadge() {
    $(document).on('click', '.process-wrap .badge', function (e) {
      var pid = $(this).data('process-id');

      socket.emit('killProcess', { id: pid });
    });
  }
}(jQuery));
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
      showLog(data);
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
    $('#logs .shell-body').append('<li>[' + log.date + '] ' + formatTypeLog(log.type) + ' - ' + log.data + '</li>');
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
