'use strict';

var test = require('tape');
var InMemoryStore = require('../../lib/datastores/in-memory-store.js');

test('[in-memory-store] create store without using new', function (t) {
  t.ok(InMemoryStore(), 'instance was created even without using new');
  t.end();
});

test('[in-memory-store] saveDocument', function (t) {
  var store = new InMemoryStore();
  const document = { id: 1, content: 'It is a dark time for the Rebellion' };
  t.ok(store.saveDocument(document), 'Document was saved');

  t.end();
});

test('[in-memory-store] getDocument', function (t) {
  var store = new InMemoryStore();
  const document = { id: 1, content: 'It is a dark time for the Rebellion' };
  store.saveDocument(document);
  const readDoc = store.getDocument(document.id);
  t.equals(readDoc.id, document.id);
  t.equals(readDoc.content, document.content);
  t.notOk(readDoc.clientId, 'document should not have a client id');

  t.end();
});

test('[in-memory-store] updateDocument', function (t) {
  var store = new InMemoryStore();
  const document = { id: 1, content: 'It is a dark time for the Rebellion' };
  store.saveDocument(document);

  document.content = document.content + '.';
  store.updateDocument(document);

  const readDoc = store.getDocument(document.id);
  t.equals(readDoc.id, document.id);
  t.equals(readDoc.content, document.content);
  t.notOk(readDoc.clientId, 'document should not have a client id');

  t.end();
});

test('[in-memory-store] removeDocument', function (t) {
  var store = new InMemoryStore();
  const document = { id: 1, content: 'It is a dark time for the Rebellion' };
  store.saveDocument(document);
  t.ok(store.getDocument(document.id));
  store.removeDocument(document.id);
  t.notOk(store.getDocument(document.id));

  t.end();
});

test('[in-memory-store] saveEdit', function (t) {
  const store = new InMemoryStore();
  const docId = '1234';
  const clientId = '5678';
  const edit = {
    id: docId,
    clientId: clientId,
    diffs: []
  };
  store.saveEdit(edit);
  const edits = store.getEdits(docId, clientId);
  t.equals(edits[0].id, docId);
  t.equals(edits[0].clientId, clientId);
  t.end();
});

test('[in-memory-store] saveEdit existing edits', function (t) {
  const store = new InMemoryStore();
  const docId = '1234';
  const clientId = '5678';
  const edit1 = {
    id: docId,
    clientId: clientId,
    diffs: []
  };
  const edit2 = {
    id: docId,
    clientId: clientId,
    diffs: []
  };
  store.saveEdit(edit1);
  store.saveEdit(edit2);
  const edits = store.getEdits(docId, clientId);
  t.equals(edits.length, 2);
  t.end();
});

test('[in-memory-store] removeEdit', function (t) {
  const store = new InMemoryStore();
  const docId = '1234';
  const clientId = '5678';
  const edit = {
    id: docId,
    clientId: clientId,
    diffs: []
  };
  store.saveEdit(edit);
  const edits = store.getEdits(docId, clientId);
  store.removeEdit(edits[0]);
  t.end();
});

test('[in-memory-store] saveShadow', function (t) {
  const store = new InMemoryStore();
  const docId = '1234';
  const clientId = '5678';
  const document = { id: docId, content: 'It is a dark time for the Rebellion' };
  store.saveDocument(document);
  store.saveShadow(document, clientId);

  const shadow = store.getShadow(docId, clientId);
  console.log(shadow.serverVersion);
  t.equals(shadow.id, docId);
  t.equals(shadow.clientId, clientId);
  t.equals(shadow.clientVersion, 0, 'shadow must have a clientVersion');
  t.equals(shadow.serverVersion, 0, 'shadow must have a serverVersion');
  t.end();
});

test('[in-memory-store] getShadow none saved', function (t) {
  const store = new InMemoryStore();
  const docId = '1234';
  const clientId = '5678';
  const document = { id: docId, content: 'It is a dark time for the Rebellion' };
  store.saveDocument(document);

  const shadow = store.getShadow(docId, clientId);
  t.notOk(shadow);
  t.end();
});

test('[in-memory-store] removeShadow', function (t) {
  const store = new InMemoryStore();
  const docId = '1234';
  const clientId = '5678';
  const document = { id: docId, content: 'It is a dark time for the Rebellion' };
  store.saveDocument(document);
  store.saveShadow(document, clientId);
  t.ok(store.getShadow(docId, clientId));
  store.removeShadow(docId, clientId);
  t.notOk(store.getShadow(docId, clientId));
  t.end();
});

test('[in-memory-store] saveShadowBackup', function (t) {
  const store = new InMemoryStore();
  const docId = '1234';
  const clientId = '5678';
  const document = { id: docId, content: 'It is a dark time for the Rebellion' };
  store.saveDocument(document);
  const shadow = store.saveShadow(document, clientId);
  const backup = store.saveShadowBackup(shadow, 1);
  t.equals(backup.version, 1, 'backup must have a version');
  t.equals(backup.shadow.id, docId);
  t.equals(backup.shadow.clientId, clientId);
  t.equals(backup.shadow.serverVersion, 0, 'shadow must have a serverVersion');
  t.equals(backup.shadow.clientVersion, 0, 'shadow must have a clientVersion');
  t.end();
});

test('[in-memory-store] getShadowBackup', function (t) {
  const store = new InMemoryStore();
  const docId = '1234';
  const clientId = '5678';
  const document = { id: docId, content: 'It is a dark time for the Rebellion' };
  store.saveDocument(document);
  const shadow = store.saveShadow(document, clientId);
  store.saveShadowBackup(shadow, 1);
  const backup = store.getShadowBackup(docId, clientId);
  t.equals(backup.version, 1, 'backup must have a version');
  t.equals(backup.shadow.id, docId);
  t.equals(backup.shadow.clientId, clientId);
  t.equals(backup.shadow.serverVersion, 0, 'shadow must have a serverVersion');
  t.equals(backup.shadow.clientVersion, 0, 'shadow must have a clientVersion');
  t.end();
});

test('[in-memory-store] removeShadowBackup', function (t) {
  const store = new InMemoryStore();
  const docId = '1234';
  const clientId = '5678';
  const document = { id: docId, content: 'It is a dark time for the Rebellion' };
  store.saveDocument(document);
  const shadow = store.saveShadow(document, clientId);
  store.saveShadowBackup(shadow, clientId);
  t.ok(store.getShadowBackup(docId, clientId));
  store.removeShadowBackup(docId, clientId);
  t.notOk(store.getShadowBackup(docId, clientId));
  t.end();
});

