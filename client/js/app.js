(function($, ace) {
  var inputsHistory = [];
  var indexInputHistorySelected = null;

  $(document).ready(function() {
    initEditor();
    onSubmitShellForm();
    onKeydownShellInput();
    onClickProcessBadge();
  });

  function initEditor() {
    window.Editor = ace.edit('editor');
    Editor.setTheme('ace/theme/monokai');
    Editor.getSession().setMode('ace/mode/javascript');
  }

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
    $(document).on('keydown', '#Apps [name="exec"]', function (e) {
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
}(jQuery, ace));
