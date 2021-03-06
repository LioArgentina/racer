// Generated by CoffeeScript 1.4.0
var Field, allOtPaths;

Field = require('./Field.server');

module.exports = {
  type: 'Store',
  events: {
    init: function(store) {
      var otFields;
      store._otFields = otFields = {};
      store._pubSub.on('ot', function(clientId, data) {
        var socket;
        if (socket = store._clientSockets[clientId]) {
          if (socket.id === data.meta.src) {
            return;
          }
          return socket.emit('otOp', data);
        }
      });
      return store.on('fetch', function(out) {
        var otData, otField, otPath, otPaths, root, value, _i, _j, _len, _len1, _ref, _ref1;
        otPaths = [];
        _ref = out.data;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          _ref1 = _ref[_i], root = _ref1[0], value = _ref1[1];
          allOtPaths(value, root, otPaths);
        }
        if (!otPaths.length) {
          return;
        }
        out.ot = otData = {};
        for (_j = 0, _len1 = otPaths.length; _j < _len1; _j++) {
          otPath = otPaths[_j];
          if (otField = otFields[otPath]) {
            otData[otPath] = otField;
          }
        }
      });
    },
    socket: function(store, socket) {
      var db, otFields;
      otFields = store._otFields;
      db = store._db;
      return socket.on('otOp', function(msg, fn) {
        var field, flushViaFieldClient, op, path, v;
        path = msg.path, op = msg.op, v = msg.v;
        flushViaFieldClient = function() {
          var fieldClient;
          if (!(fieldClient = field.client(socket.id))) {
            fieldClient = field.registerSocket(socket);
          }
          fieldClient.queue.push([msg, fn]);
          return fieldClient.flush();
        };
        if (!(field = otFields[path])) {
          field = otFields[path] = new Field(store, path, v);
          return db.get(path, function(err, val, ver) {
            var snapshot;
            snapshot = field.snapshot = (val != null ? val.$ot : void 0) || '';
            return flushViaFieldClient();
          });
        } else {
          return flushViaFieldClient();
        }
      });
    }
  }
};

allOtPaths = function(obj, root, results) {
  var key, value;
  if (obj && obj.$ot) {
    results.push(root);
    return;
  }
  if (typeof obj !== 'object') {
    return;
  }
  for (key in obj) {
    value = obj[key];
    if (!value) {
      continue;
    }
    if (value.$ot) {
      results.push(root + '.' + key);
      continue;
    }
    allOtPaths(value, key);
  }
};
