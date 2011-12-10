
self.port.on('command', function onMessage(command) {
  if (groove_commands[command] != undefined) {
    try {
      groove_commands[command](command);
    } catch (e) {
      self.port.emit('error', 'Error running command: ' + command + '. Details: ' + e);
    }
  } else {
    self.port.emit('error', 'Unknown command: ' + command);
  }
});

/*
 *      REPEAT('Repeat', 'toggle repeat'),
 *      SHUFFLE('Shuffle', 'toggle shuffle'),
 *      STOP('Stop', 'player-stop'),
 *      NEXT('Next', 'player-next'),
 *      PREV('Previous', 'player-prev'),
 *      PLAY('Play', 'player-play'),
 *      PAUSE('Pause', 'player-pause'),
 *      // FILE('player-play %s');
 *      // VOLUME('vol %s'),
 *      VOLUME_MUTE('Mute', 'vol -100%'),
 *      VOLUME_UP('Volume +', 'vol +10%'),
 *      VOLUME_DOWN('Volume -', 'vol -10%'),
 *      // SEEK('seek %s'),
 *      STATUS('Status', 'status');
 */
var groove_commands = {
    'status': function(command) {
      throw 'Command ' + command + ' not implemented!';
    },
    'player-play': function(command) {
      var el= $('#player_play_pause');
      if (el.hasClass('play') && el.attr('disabled') != 'disabled') {
        el.click();
      }
    },
    'player-pause': function(command) {
      var el= $('#player_play_pause');
      if (el.hasClass('pause') && el.attr('disabled') != 'disabled') {
        el.click();
      }
    },
    'player-stop': function(command) {
      groove_commands['player-pause'](command);
      // TODO: Restart song
    },
    'player-next': function(command) {
      $('#player_next').click();
    },
    'player-prev': function(command) {
      $('#player_previous').click();
    },
    'toggle shuffle': function(command) {
      $('#player_shuffle').click();
    },
    'toggle repeat': function(command) {
      $('#player_loop').click();
    },
    'vol -100%': function(command) {
      var el= $('#player_volume');
      if (el.attr('disabled') != 'disabled') {
        el.click();
      }
    },
    'vol +10%': function(command) {
      // Cause a strange error... but works
      unsafeWindow.GS.player.setVolume(unsafeWindow.GS.player.getVolume() + 10);
    },
    'vol -10%': function(command) {
      // Cause a strange error... but works
      unsafeWindow.GS.player.setVolume(unsafeWindow.GS.player.getVolume() - 10);
    }
};
