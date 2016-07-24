'use strict';

var Promise = require('bluebird');

exports.createPromiseCallback = () => {
  let cb;
  let promise = new Promise((resolve, reject) => {
    cb = (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    };
  });
  cb.promise = promise;
  return cb;
};
