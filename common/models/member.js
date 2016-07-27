'use strict';

const crypto = require('crypto');
const debug = require('debug')('barry:member');
const utils = require('../../lib/utils');

const DEFAULT_TTL = 1209600; // 2 weeks in seconds

module.exports = (Member) => {
  /**
   * Login a member with the given `credentials`.
   *
   * @param {Object} credentials username/password
   * @callback {Function} callback Callback function
   * @param {Error} err Error Object
   * @param {Object} member Member info
   * @promise
   */
  Member.login = (credentials, callback = utils.createPromiseCallback()) => {
    const query = Member.normalizeCredentials(credentials);
    if (!query.email && !query.username) {
      const err = new Error('username or email is required');
      err.statusCode = 400;
      err.code = 'USERNAME_EMAIL_REQUIRED';
      callback(err);
      return callback.promise;
    }

    Member.findOne({where: query}, (err, member) => {
      const defaultError = new Error('login failed');
      defaultError.statusCode = 401;
      defaultError.code = 'LOGIN_FAILED';

      function tokenHandler(err, token) {
        if (err) return callback(err);
        token.__data.user = member;
        return callback(err, token);
      }

      if (err) {
        debug('An error is reported from Member.findOne: %j', err);
        callback(defaultError);
      } else if (member) {
        if (Member
            .hasPassword(credentials.password, member.password, member.salt)) {
          member.accessTokens.create({ttl: DEFAULT_TTL}, tokenHandler);
        } else {
          debug('The password is invalid for member %s',
            query.email || query.username);
          callback(defaultError);
        }
      }
    });

    return callback.promise;
  };

  Member.normalizeCredentials = (credentials) => {
    const query = {};
    query.username = credentials.username;
    return query;
  };

  Member.hasPassword = (plain, password, salt) => {
    if (plain && password && salt) {
      const hash1 = crypto.createHash('md5')
              .update(plain)
              .digest('hex');
      const hash2 = crypto.createHash('md5')
              .update(hash1 + salt)
              .digest('hex');
      return hash2 === password;
    } else {
      return false;
    }
  };

  Member.setup = () => {
    Member.remoteMethod(
      'login',
      {
        description: 'Login a member with username and password.',
        accepts: [
          {arg: 'credentials', type: 'object', required: true,
            http: {source: 'body'}},
        ],
        returns: {
          arg: 'member', type: 'object', root: true,
          description: 'The response body contains properties ' +
            'of the currently logged in member.',
        },
        http: {verb: 'post'},
      }
    );
  };

  Member.setup();
};
