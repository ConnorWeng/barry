'use strict';

const Promise = require('bluebird');

exports.createPromiseCallback = function createPromiseCallback() {
  let cb;
  const promise = new Promise((resolve, reject) => {
    cb = (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    };
  });
  cb.promise = promise;
  return cb;
};
