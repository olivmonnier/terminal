(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

(function ($) {
  var inputsHistory = [];
  var indexInputHistorySelected = null;

  $(document).ready(function () {
    onSubmitShellForm();
    onKeydownShellInput();
    onClickProcessBadge();
  });

  function onSubmitShellForm() {
    $(document).on('submit', '#shellForm', function (e) {
      e.preventDefault();

      var cmd = $('[name="exec"]').val();

      inputsHistory.push(cmd);
      indexInputHistorySelected = inputsHistory.length;
      $.post('/', { exec: cmd }).done(function () {
        $('[name="exec"]').val('');
      });
    });
  }

  function onKeydownShellInput() {
    $(document).on('keydown', '#logs [name="exec"]', function (e) {
      if (e.which === 38 || e.which === 40) {
        if (e.which === 38) {
          //UP
          if (inputsHistory.length >= 0) indexInputHistorySelected -= 1;
        } else if (e.which === 40) {
          //DOWN
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
})(jQuery);

},{}],2:[function(require,module,exports){
'use strict';

require('./plugins');

require('./app');

require('./websockets');

},{"./app":1,"./plugins":3,"./websockets":4}],3:[function(require,module,exports){
"use strict";

jQuery.fn.scrollBottom = function () {
  return $(document).height() - this.scrollTop() - this.height();
};

},{}],4:[function(require,module,exports){
'use strict';

(function (io, $) {
  var socket = io.connect('/');

  socket.on('init', function (data) {
    data.history.forEach(function (log) {
      showLog(log);
    });
    data.process.forEach(function (proc) {
      showProcessBadge(proc);
    });
  });
  ['response', 'error', 'exit'].forEach(function (event) {
    socket.on(event, function (data) {
      if (data) showLog(data);
    });
  });

  socket.on('clear', function () {
    $('#logs .shell-body li').remove();
  });

  socket.on('response', function (data) {
    if (data.id) {
      showProcessBadge(data);
    }
  });

  socket.on('exit', function (data) {
    $('[data-process-id="' + data.id + '"]').remove();
  });

  function showLog(log) {
    var $shellBody = $('#logs .shell-body');

    $shellBody.find('ul').append('<li>[' + log.date + '] ' + formatTypeLog(log.type) + ' - ' + log.data + '</li>').parent().scrollTop($shellBody[0].scrollHeight);
  }

  function showProcessBadge(process) {
    $('.process-wrap').append('<span class="badge" data-process-id="' + process.id + '">' + process.data + '</span>');
  }

  function formatTypeLog(type) {
    if (type === 'response') {
      return '';
    } else if (type === 'error') {
      return '<span class="color-error">[ERROR]</span>';
    } else if (type === 'exit') {
      return '<span class="color-complete">[exit code]</span>';
    }
  }
})(io, jQuery);

},{}]},{},[2]);
