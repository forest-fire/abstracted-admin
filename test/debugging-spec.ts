import DB from '../src/db';
import * as chai from 'chai';
import * as helpers from './testing/helpers';
const expect = chai.expect;
helpers.setupEnv();

describe('Debugging: ', () => {

  it('"debugging: true" results in logging to STDOUT', async () => {
    const restore = helpers.captureStdout();
    const db = new DB({ debugging: true });
    await db.waitForConnection();
    const output: string[] = restore();
    expect(output).to.be.an('array');

    expect(output.some(el => el.indexOf('[FIREBASE]') !== -1), 'expected FIREBASE to be in stdout').to.equal(true);
  });

  it('"debugging: callback" sends results to callback', async () => {
    const restore = helpers.captureStdout();
    let count = 0;
    const callback = (message: string) => {
      console.log('Received message: ', message);
      expect(message).to.be.a('string');
      count++;
    };
    const db = new DB({ debugging: callback });
    await db.waitForConnection();
    const output: string[] = restore();
    expect(output.some(el => el.indexOf('[FIREBASE]') !== -1)).to.equal(false);
    expect(count).to.greaterThan(0);
  });
});
