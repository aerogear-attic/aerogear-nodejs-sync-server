'use strict';

const InMemoryDataStore = require('../lib/datastores/in-memory-store.js');
const DiffMatchPatchSynchronizer = require('../lib/synchronizers/diff-match-patch.js');
const SyncEngine = require('../lib/sync-engine.js');
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:7777/sync');

const clientId = '5678';

const syncEngine = new SyncEngine(new DiffMatchPatchSynchronizer(),
                                  new InMemoryDataStore());
ws.on('open', function open () {
  const seedDoc = {
    id: '1234',
    content: 1
  }
  const subscribe = {
    msgType: 'subscribe',
    id: seedDoc.id,
    clientId: clientId,
    content: seedDoc.content
  }
  syncEngine.addDocument(seedDoc, subscribe.clientId);
  ws.send(JSON.stringify(subscribe));
});

ws.on('message', function (data, flags) {
  console.log(data);
  var json;
  try {
    json = JSON.parse(data);
  } catch (e) {
    this.emit('error', e);
    return;
  }

  switch (json.msgType) {
    case 'patch':
      console.log('Received patchMessage...', json);
      syncEngine.patch(json);
      const doc = syncEngine.getDocument(json.id);
      doc.content += 1;
      const p = syncEngine.serverDiff(doc, syncEngine.getShadow(doc.id, clientId));
      console.log(p);
       //ws.send(JSON.stringify(p));
      break;
    case 'error':
      console.log('Error', json.content);
      break;
  }
});
