'use strict';

jest.unmock('../../../common/models/member');

const MemberModel = require('../../../common/models/member');

describe('Member', () => {
  let member;

  class Member {
    constructor() {
      this.accessTokens = {
        create: (options, callback) => {
          callback(null, {});
        },
      };
    }
    remoteMethod() {}
    findOne(query, callback) {
      callback(null, {
        username: query.where.username,
        password: query.where.password,
        salt: 'salt',
        accessTokens: {
          create: (options, callback) => {
            callback(null, {
              id: 'access_token_id',
              __data: {
                user: {},
              },
            });
          },
        },
      });
    }
  };

  beforeEach(() => {
    member = new Member();
    MemberModel(member);
  });

  describe('login', () => {
    it('should return an access token ' +
       'if correct username and password are given', (done) => {
      member.hasPassword = () => { return true; };
      member.login({username: 'foo', password: 'bar'}, (err, token) => {
        expect(token.__data.user.username).toBe('foo');
        expect(token.id).toBe('access_token_id');
        done();
      });
    });
  });

  describe('hasPassword', () => {
    it('should return true ' +
       'if the given plain password encrypted with salt ' +
       'equals the password in the db', () => {
      expect(member.hasPassword(
        '123456',
        '73f1bbf2e971a113ef584ee844592369',
        'ba1b66'
      )).toBeTruthy();
    });
  });
});
