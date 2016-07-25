'use strict';

jest.unmock('../../../common/models/member');

const MemberModel = require('../../../common/models/member');

describe('Member', () => {
  let member;

  class Member {
    constructor() {}
    remoteMethod() {}
    findOne(query, callback) {
      callback(null, {username: 'foo', password: 'bar', salt: 'salt'});
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
      member.login({username: 'foo', password: 'bar'}, (err, member) => {
        expect(member).toEqual({
          username: 'foo', password: 'bar', salt: 'salt',
        });
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
