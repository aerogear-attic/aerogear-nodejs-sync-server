'use strict';

const DiffMatchPatch = require('diff-match-patch');
// eslint-disable-next-line new-cap
const dmp = new DiffMatchPatch();

/**
 * A Synchronizer that uses [Diff-Match-Patch]{@link https://code.google.com/p/google-diff-match-patch/}
 * and is capable of handling content as strings and JSON.
 */
var DiffMatchPatchSynchronizer = function (options) {
  if (!(this instanceof DiffMatchPatchSynchronizer)) {
    return new DiffMatchPatchSynchronizer(options);
  }

  /**
   * Called when the shadow should be patched. Is called when an update is recieved.
   *
   * @param edit - the edits to be applied
   * @param shadowDoc - the shadow document to patch (apply the edits to)
   * @return shadowDoc - the patched shadow document
   */
  this.patchShadow = function (edit, shadowDoc) {
    shadowDoc.content = patch(edit.diffs, shadowDoc.content);
    return shadowDoc;
  };

  /**
   * Called when the document should be patched.
   *
   * @param edit - the edits to be applied
   * @param doc - the document to patch (apply the edits to)
   * @return doc - the patched document
   */
  this.patchDocument = function (edit, doc) {
    doc.content = patch(edit.diffs, doc.content);
    return doc;
  };

  /**
   * The first step in a sync is to produce a an edit for the changes.
   * The produced edit can then be sent to the opposing side perform an update/sync.
   *
   * @param doc - the document to patch (apply the edits to)
   * @param shadowDoc - the shadow document to patch (apply the edits to)
   */
  this.serverDiff = function (doc, shadowDoc) {
    return performDiff(doc, shadowDoc, 'server');
  };

  /**
   * Is called to produce an {@link Edit} of changes coming from a client.
   *
   * @param doc - the document do diff
   * @param shadowDoc - the document shadow containing the client changes.
   * @return edit - the edit representing the diff between the document and it's shadow document.
   */
  this.clientDiff = function (doc, shadowDoc) {
    return performDiff(doc, shadowDoc, 'client');
  };

  /**
   * Creates a new PatchMessage with the with the type of Edit that this
   * synchronizer can handle.
   * @param docId - the document identifier for the {@code PatchMessage}
   * @param clientId - the client identifier for the {@code PatchMessage}
   * @param edits - the {@link Edit}s for the {@code PatchMessage}
   * @return PatchMessage - the created {code PatchMessage}
   */
  this.createPatchMessage = function (docId, clientId, edits) {
    return {
      id: docId,
      clientId: clientId,
      edits: edits
    };
  };

  return this;
};

function asDmpOperation (op) {
  switch (op) {
    case 'DELETE':
      return -1;
    case 'ADD':
      return 1;
    default:
      return 0;
  }
}

function asAgOperation (op) {
  switch (op) {
    case -1:
      return 'DELETE';
    case 1:
      return 'ADD';
    default:
      return 'UNCHANGED';
  }
}

function performDiff (doc, shadow, type) {
  var diffs, docContent, shadowContent;
  if (typeof doc.content !== 'string') {
    docContent = JSON.stringify(doc.content);
    shadowContent = JSON.stringify(shadow.content);
  } else {
    docContent = doc.content;
    shadowContent = shadow.content;
  }

  if (type === 'server') {
    diffs = dmp.diff_main(shadowContent, docContent);
  } else {
    diffs = dmp.diff_main(docContent, shadowContent);
  }

  return {
    serverVersion: shadow.serverVersion,
    clientVersion: shadow.clientVersion,
    checksum: shadow.checksum,
    diffs: diffs.map(function (value) {
      return {
        operation: asAgOperation(value[0]),
        text: value[1]
      };
    })
  };
}

function patch (diffs, content) {
  var dmpDiffs, patches, patchResult, shadowContent;

  content = typeof content === 'string' ? content : JSON.stringify(content);

  dmpDiffs = diffs.map(function (value) {
    return [asDmpOperation(value.operation), value.text];
  });
  patches = dmp.patch_make(content, dmpDiffs);
  patchResult = dmp.patch_apply(patches, content);

  try {
    shadowContent = JSON.parse(patchResult[0]);
  } catch (e) {
    shadowContent = patchResult[0];
  }

  return shadowContent;
}

module.exports = DiffMatchPatchSynchronizer;
