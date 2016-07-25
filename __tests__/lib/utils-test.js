'use strict';

jest.unmock('../../lib/utils');

const {createPromiseCallback} = require('../../lib/utils');

describe('createPromiseCallback', () => {
  it('should return a promise could be resolved later', (done) => {
    jest.useRealTimers();
    const callback = createPromiseCallback();
    setTimeout(() => {
      callback(null, {success: true});
    }, 1000);
    callback.promise.then((data) => {
      expect(data).toEqual({success: true});
      done();
    });
  });
});
