const utils = require('../utils');

/**
 * A server side DataStore implementation is responsible for storing
 * and serving data for a Differential Synchronization implementation.
 *
 * @constructor
 */
var InMemoryDataStore = function () {
  var docs = {};
  var edits = {};
  var shadows = {};
  var backups = {};

  if (!(this instanceof InMemoryDataStore)) {
    return new InMemoryDataStore();
  }

  /**
   * Retrieves the link Document matching the passed-in document documentId.
   *
   * @param documentId the document identifier of the shadow document.
   * @returns Object - the document
   */
  this.getDocument = function (docId) {
    return docs[docId];
  };

  /**
   * Saves a server document.
   *
   * @param doc - the document to store
   * @returns Boolean - true if the document was stored
   */
  this.saveDocument = function (doc) {
    if (!docs[doc.id]) {
      docs[doc.id] = utils.poorMansCopy(doc);
      return true;
    }
    return false;
  };

  /**
   * Updates an existing document in the store
   *
   * @param doc - the document to update
   */
  this.updateDocument = function (doc) {
    var existingDoc = this.getDocument(doc.id);
    if (existingDoc) {
      docs[doc.id] = utils.poorMansCopy(doc);
    }
  };

  /**
   * Removes the document from the store
   *
   * @param id - the document to remove
   */
  this.removeDocument = function (id) {
    if (docs[id]) {
      delete docs[id];
    }
  };

  /**
   * Saves a shadow of the document for the client.
   *
   * @param doc - the document to create a shadow of
   * @param clientId - the client id for which the shadow belongs to
   * @param serverVersion - the servers version that the shadow should be based on
   * @param clientVersion - the client version that this shadow should match
   * @return shadow - the saved shadow document
   */
  this.saveShadow = function (doc, clientId, serverVersion, clientVersion) {
    var sversion = (typeof serverVersion !== 'undefined') ? serverVersion : 0;
    var cversion = (typeof clientVersion !== 'undefined') ? clientVersion : 0;
    var shadow = {
      id: doc.id,
      serverVersion: sversion,
      clientId: clientId,
      clientVersion: cversion,
      content: doc.content
    };

    if (shadows[doc.id]) {
      shadows[doc.id].push(shadow);
    } else {
      shadows[doc.id] = [shadow];
    }
    return utils.poorMansCopy(shadow);
  };

  /**
   * Returns the shadow document for the document id and client id
   * combination.
   *
   * @param id - the document id
   * @param clientId - the client id
   */
  this.getShadow = function (id, clientId) {
    if (!shadows[id]) {
      return undefined;
    }
    const shadowForClient = shadows[id].filter(function (shadow) {
      return shadow.clientId === clientId;
    });
    return shadowForClient[0];
  };

  /**
   * Remove the shadow document for the document id and client id
   * combination.
   *
   * @param id - the document id
   * @param clientId - the client id
   */
  this.removeShadow = function (id, clientId) {
    if (shadows[id]) {
      shadows[id].forEach(function (shadow, index, object) {
        if (clientId === shadow.clientId) {
          object.splice(index, 1);
        }
      });
    }
  };

  /**
   * Saves a backup of the clients shadow document
   */
  this.saveShadowBackup = function (shadow, version) {
    var backup = { version: version, shadow: utils.poorMansCopy(shadow) };
    if (backups[shadow.id]) {
      backups[shadow.id].push(backup);
    } else {
      backups[shadow.id] = [backup];
    }
    return utils.poorMansCopy(backup);
  };

  /**
   * Returns the shadow back up for id/client combination.
   *
   * @param id - the document id
   * @param clientId - the client id
   * @returns backup - the backup of the shadow document
   */
  this.getShadowBackup = function (id, clientId) {
    if (!backups[id]) {
      return undefined;
    }

    const backupForClient = backups[id].filter(function (backup) {
      return backup.shadow.clientId === clientId;
    });
    return backupForClient[0];
  };

  /**
   * Remove the shadow backup for the document id and client id
   * combination.
   *
   * @param id - the document id
   * @param clientId - the client id
   */
  this.removeShadowBackup = function (id, clientId) {
    if (backups[id]) {
      backups[id].forEach(function (backup, index, object) {
        if (clientId === backup.shadow.clientId) {
          object.splice(index, 1);
        }
      });
    }
  };

  this.getEdits = function (id, clientId) {
    if (!edits[id]) {
      return [];
    }

    return edits[id].filter(function (edit) {
      return edit.id === id && edit.clientId === clientId;
    });
  };

  /**
   * Saves an Edit to the data store
   *
   * @param edit - the edit to store
   */
  this.saveEdit = function (edit) {
    if (edits[edit.id]) {
      edits[edit.id].push(edit);
    } else {
      edits[edit.id] = [edit];
    }
  };

  /**
   * Removes an edit
   *
   * @param edit - the edit to store
   */
  this.removeEdit = function (edit) {
    if (edits[edit.id]) {
      edits[edit.id].forEach(function (value, index, object) {
        if (edit.clientId === value.clientId) {
          object.splice(index, 1);
        }
      });
    }
  };
};

module.exports = InMemoryDataStore;
