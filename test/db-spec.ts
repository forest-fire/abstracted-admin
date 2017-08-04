import DB from '../src/db';
import * as chai from 'chai';
import * as helpers from './testing/helpers';

const expect = chai.expect;

describe('Connecting to Database', () => {
  it('can not instantiate without setting FIREBASE_SERVICE_ACCOUNT and FIREBASE_DATA_ROOT_URL', () => {
    try {
      const db = new DB();
      expect(true).to.equal(false);
    } catch (e) {
      expect(true).to.equal(true);
    }
  });

  it('once ENV is setup, can instantiate', () => {
    helpers.setupEnv();
    const db = new DB();
    expect(true).to.equal(true);
  });

  it('can get a value from database once waitForConnection() returns', async () => {
    const db = new DB();
    const connected = await db.getValue<boolean>('.info/connected');
    expect(connected).to.be.a('boolean');
    await db.waitForConnection();
    expect(db.isConnected).to.equal(true);
  });

});
