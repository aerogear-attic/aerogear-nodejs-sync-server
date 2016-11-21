'use strict';

const util = require('util');
const debuglog = util.debuglog('sync-handler');

const EventEmitter = require('events').EventEmitter;

var SyncHandler = function (syncEngine) {
  if (!(this instanceof SyncHandler)) {
    return new SyncHandler(syncEngine);
  }
  this.syncEngine = syncEngine;
  this.subscribers = new Subscribers(this);
  EventEmitter.call(this);
};

util.inherits(SyncHandler, EventEmitter);

// TODO: This is only going to be used as a initial
// version for testing and the data structures will be updated
// to more efficient ones.
function Subscribers (emitter) {
  this.emitter = emitter;
  this.forDocument = forDocument;
  this.addSubscriber = addSubscriber;
  this.removeSubscriber = removeSubscriber;
  this.subscribers = {};
}

function forDocument (id) {
  return this.subscribers[id];
}

function addSubscriber (id, clientId, client) {
  let subscriber = new Subscriber(id, clientId, client);
  if (this.subscribers[id]) {
    this.subscribers[id].push(subscriber);
  } else {
    this.subscribers[id] = new Array(subscriber);
  }
  return subscriber;
}

function removeSubscriber (subscriber) {
  const that = this;
  if (this.subscribers[subscriber.id]) {
    this.subscribers[subscriber.id].forEach(function (value, index, object) {
      if (subscriber.clientId === value.clientId) {
        debuglog('delete subscriber: ', value.clientId);
        object.splice(index, 1);
        that.emitter.emit('subscriberDeleted', value);
      }
    });
  }
}

function Subscriber (id, clientId, client) {
  this.id = id;
  this.clientId = clientId;
  this.client = client;
}

SyncHandler.prototype.messageReceived = function (data, client) {
  var json;
  try {
    json = JSON.parse(data);
  } catch (e) {
    this.emit('error', e);
    return;
  }

  const id = json.id;
  const clientId = json.clientId;

  switch (json.msgType) {
    case 'subscribe':
      let patchMessage = this.syncEngine.addDocument(json, clientId);
      let subscriber = this.subscribers.addSubscriber(id, clientId, client);
      this.emit('subscriberAdded', JSON.stringify(patchMessage), subscriber);
      break;
    case 'patch':
      this.syncEngine.patch(json);
      var subs = this.subscribers.forDocument(id);
      const that = this;
      subs.forEach(function (subscriber) {
        const doc = that.syncEngine.getDocument(subscriber.id);
        const shadow = that.syncEngine.getShadow(subscriber.id, subscriber.clientId);
        const patchMessage = that.syncEngine.serverDiff(doc, shadow);
        that.emit('patched', JSON.stringify(patchMessage), subscriber);
      });
      break;
    case 'detach':
      this.subscribers.removeSubscriber(client.subscriber);
      this.emit('detached', client.subscriber);
      break;
    default:
      const errorMsg = {
        id: json.id,
        client: json.clientid,
        msgType: 'error',
        content: 'Unknown msgType: ' + json.msgType
      };
      this.emit('error', JSON.stringify(errorMsg), client);
  }
};

SyncHandler.prototype.clientClosed = function (subscriber) {
  this.subscribers.removeSubscriber(subscriber);
};

module.exports = SyncHandler;
