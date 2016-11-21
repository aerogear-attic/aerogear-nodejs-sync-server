/**
* @module sync
*/
'use strict';

const util = require('util');
const debuglog = util.debuglog('sync-ws-server');

const WebSocketServer = require('ws').Server;
const express = require('express');
const app = express();
const SyncHandler = require('./lib/sync-handler.js');
const SyncEngine = require('./lib/sync-engine.js');
const InMemoryDataStore = require('./lib/datastores/in-memory-store.js');
const DiffMatchPatchSynchronizer = require('./lib/synchronizers/diff-match-patch.js');

app.use(express.static('public'));

const server = app.listen(7777, 'localhost', function () {
  console.log('Server listening at ' + server.address().port);
});

const ws = new WebSocketServer({server: server, path: '/sync'});
const syncEngine = new SyncEngine(new DiffMatchPatchSynchronizer(),
                                  new InMemoryDataStore());
const syncHandler = new SyncHandler(syncEngine);
syncHandler.messageReceived.bind(syncHandler);
syncHandler.clientClosed.bind(syncHandler);

syncHandler.on('subscriberAdded', function (patchMessage, subscriber) {
  debuglog('subscriber', subscriber.clientId, 'added for doc', subscriber.id);
  // store the subscriber with the current socket
  subscriber.client.subscriber = subscriber;
  subscriber.client.send(patchMessage);
});

syncHandler.on('patched', function (patchMessage, subscriber) {
  debuglog('patch: notify active subscriber');
  subscriber.client.send(patchMessage);
});

syncHandler.on('detached', function (message, client) {
  debuglog('detached: close websocket');
  client.close();
});

syncHandler.on('error', function (errorMsg, client) {
  debuglog('error: ', errorMsg);
  client.send(errorMsg);
});

ws.on('connection', function (socket) {
  debuglog('Client Connected');

  socket.on('message', function (message) {
    syncHandler.messageReceived(message, socket);
  });

  socket.on('close', function () {
    debuglog('Closing client connection');
    syncHandler.clientClosed(socket.subscriber);
  });
});

ws.on('error', function (error) {
  debuglog('WS Server error', error);
});

