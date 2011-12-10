const widgets = require('widget');
const tabs = require('tabs');
const pageMod = require('page-mod');
var data = require('self').data;

const net = require('net/net');

const PORT = 3000;
const PASSWORD = 'password';

var logger = {
  log : function(msg) {
    console.log('remote-grooveshark: ' + msg);
  },
  warn : function(msg) {
    console.warn('remote-grooveshark: ' + msg);
  },
  error : function(msg) {
    console.error('remote-grooveshark: ' + msg);
  }
};

var workers = [];

function detachWorker(worker, workerArray) {
  var index = workerArray.indexOf(worker);
  if(index != -1) {
    workerArray.splice(index, 1);
  }
}

pageMod.PageMod({
  include: ['http://grooveshark.com/*'],
  contentScriptWhen: 'end',
  contentScriptFile: [data.url('jquery-1.4.2.min.js'),
                      data.url('runner.js')],
  onAttach: function(worker) {
    worker.port.on('error', function(data) {
      logger.error(data);
    });
    worker.on('detach', function () {
      detachWorker(this, workers);
    });
    workers.push(worker);
  }
});

var commands = ['player-play', 'player-pause', 'player-stop', 'player-next', 'player-prev', 'toggle repeat', 'toggle shuffle', /*'status'*/, 'vol -100%', 'vol +10%', 'vol -10%'];

var server = net.createServer(function(c) { //'connection' listener
  var authenticated= false;
  logger.log('server connected');
  c.on('data', function(data) {
    // Remove the line feed
    data = data.substr(0, data.length-1);
    
    if (!authenticated) {
      if (data.indexOf('passwd ') == 0) {
        authenticated= data.substr(7) == PASSWORD;
      }
      if (authenticated) {
        logger.log('Authenticated');
      } else {
        logger.log('authentication failed');
        c.write('authentication failed\n');
      }
      c.write('\n');
      return;
    }

    if (commands.indexOf(data) != -1) {
      logger.log('Handling command: ' + data);
      if (workers.length == 0) {
        c.write('Grooveshark is not running!\n');
      }
      workers.forEach(function (worker) {
        worker.port.emit('command', data);
      });
    } else {
      logger.log('Unknown command: ' + data);
      c.write('Unknown command: ' + data + '\n');
    }
    c.write('\n');
  });
  c.on('end', function() {
    logger.log('server disconnected');
    authenticated= false;
  });
});

server.on('error', function(e) {
  logger.error(e);
  logger.error('Is address already in use?');
  // TODO: Handle Address in use!
  /*
  if (e.code == 'EADDRINUSE') {
    console.log('Address in use, retrying...');
    setTimeout(function () {
      server.close();
      server.listen(PORT);
    }, 1000);
  }*/
});

server.listen(PORT, function() { //'listening' listener
  logger.log('server bound');
});

logger.log('running!');
