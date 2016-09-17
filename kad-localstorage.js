#!/usr/bin/env node

'use strict'

module.exports = KadLocalStorage

var EventEmitter = require('events').EventEmitter
var setImmediate = require('async.util.setimmediate')

function KadLocalStorage (namespace) {
  if (namespace.indexOf('_') >= 0) throw new Error('invalid namespace')
  this._prefix = namespace + '_'
}

KadLocalStorage.prototype.get = function (key, cb) {
  var val = localStorage.getItem(this._prefix + key)
  if (!val) {
    setImmediate(function () {
      if (cb) {
        cb(new Error('key not found: ' + key))
      }
    })
  } else {
    setImmediate(function () {
      if (cb) {
        cb(null, val)
      }
    })
  }
}

KadLocalStorage.prototype.put = function (key, val, cb) {
  key = this._prefix + key
  localStorage.setItem(key, val)
  setImmediate(function () {
    if (cb) {
      cb(null)
    }
  })
}

KadLocalStorage.prototype.del = function (key, cb) {
  key = this._prefix + key
  localStorage.removeItem(key)
  setImmediate(function () {
    if (cb) {
      cb(null)
    }
  })
}

KadLocalStorage.prototype.createReadStream = function () {
  var storage = this
  var stream = new EventEmitter()
  setTimeout(function () {
    var len = localStorage.length
    for (var i = 0; i < len; i++) {
      var unprefixedKey = localStorage.key(i)
      var isOwnKey = unprefixedKey.indexOf(storage._prefix) === 0
      if (!isOwnKey) continue
      var key = unprefixedKey.substring(storage._prefix.length)
      storage.get(key, onGet.bind(null, key))
    }
    stream.emit('end')
  })
  return stream

  function onGet (key, err, val) {
    stream.emit('data', {
      key: key,
      value: val
    })
  }
}
