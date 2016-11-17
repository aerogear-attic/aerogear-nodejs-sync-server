'use strict';
var test = require('tape');
var DiffMatchPatchSynchronizer = require('../../lib/synchronizers/diff-match-patch');

test('[diff-match-patch synchronizer] create new DiffMatchPatchSynchronizer', function (t) {
  t.ok(DiffMatchPatchSynchronizer() instanceof DiffMatchPatchSynchronizer,
       'DiffMatchPatchSynchronizer should usable as a constructor');
  t.end();
});

test('[diff-match-patch synchronizer] clientDiff', function (t) {
  const documentId = '1234';
  const clientId = 'client1';
  var synchronizer = DiffMatchPatchSynchronizer();

  var edit;
  var source = {
    id: documentId,
    clientId: clientId
  };
  var shadow = {
    id: documentId,
    clientId: clientId
  };

  source.content = 'test';
  shadow.clientVersion = 0;
  shadow.serverVersion = 0;
  shadow.content = 'testing';

  edit = synchronizer.clientDiff(source, shadow);
  t.equal(edit.diffs.length, 2, 'there should be two diffs in edit');
  t.equal(edit.diffs[0].operation, 'UNCHANGED', 'first diff operation should be \'UNCHANGED\'');
  t.equal(edit.diffs[0].text, 'test', 'first diff text should remain unchanged');
  t.equal(edit.diffs[1].operation, 'ADD', 'second diff operation should be \'ADD\'');
  t.equal(edit.diffs[1].text, 'ing', 'second diff text should be \'ing\'');

  t.end();
});

test('[diff-match-patch synchronizer] serverDiff', function (t) {
  const documentId = '1234';
  const clientId = 'client1';
  var synchronizer = DiffMatchPatchSynchronizer();

  var edit;
  var source = {
    id: documentId,
    clientId: clientId
  };
  var shadow = {
    id: documentId,
    clientId: clientId
  };

  source.content = 'test';
  shadow.clientVersion = 0;
  shadow.serverVersion = 0;
  shadow.content = 'testing';

  edit = synchronizer.serverDiff(source, shadow);
  t.equal(edit.diffs.length, 2, 'there should be two diffs in edit');
  t.equal(edit.diffs[0].operation, 'UNCHANGED', 'first diff operation should be \'UNCHANGED\'');
  t.equal(edit.diffs[0].text, 'test', 'first diff text should remain unchanged');
  t.equal(edit.diffs[1].operation, 'DELETE', 'second diff operation should be \'DELETE\'');
  t.equal(edit.diffs[1].text, 'ing', 'second diff text should be \'ing\'');

  t.end();
});

test('[diff-match-patch synchronizer] patchShadow', function (t) {
  const documentId = '1234';
  const clientId = 'client1';
  const synchronizer = DiffMatchPatchSynchronizer();
  var patchedShadow;
  var doc = {
    id: documentId,
    clientId: clientId,
    content: 'Beve'
  };

  var shadow = {
    id: doc.id,
    clientId: doc.clientId,
    serverVersion: 0,
    clientVersion: 0,
    content: doc.content
  };

  var updatedDoc = {
    id: documentId,
    clientId: clientId,
    content: 'Cool Dude'
  };

  const edit = synchronizer.clientDiff(doc, updatedDoc);
  patchedShadow = synchronizer.patchShadow(edit, shadow);
  t.equal(patchedShadow.content, 'Cool Dude', 'shadow test should be Cool Dude');
  t.equal(patchedShadow.serverVersion, 0, 'serverVersion should be 0');
  t.equal(patchedShadow.clientVersion, 0, 'clientVersion should be 0');

  t.end();
});
