import DB from '../src/db';
import * as chai from 'chai';
import {Query} from '../src/query';
import { SchemaCallback } from 'firemock';
import * as helpers from './testing/helpers';

const expect = chai.expect;

interface IPerson {
  name: string;
  age: number;
}

describe('Query based Read ops:', () => {
  helpers.setupEnv();
  const db = new DB(process.env.MOCK ? {mocking: true} : {});
  const personMockGenerator: SchemaCallback = (h) => () => ({
    name: h.faker.name.firstName() + ' ' + h.faker.name.lastName(),
    age: h.faker.random.number({min: 10, max: 99})
  });
  before(async () => {
    db.allowMocking();
    db.mock.addSchema('person', personMockGenerator);
    db.mock.queueSchema('person', 20);
    db.mock.queueSchema('person', 5, {age: 100});
    db.mock.queueSchema('person', 5, {age: 1});
    db.mock.queueSchema('person', 3, {age: 3});
    db.mock.generate();
    if (! process.env.MOCK) {
      await db.set('people', db.mock.db);
    }
  });

  it('getSnapshot() works with query passed in', async () => {
    let data = await db.getSnapshot('people');
    expect(data.numChildren()).to.equal(33); // baseline check
    const q = Query.path('people').orderByChild('age').limitToFirst(5);
    data = await db.getSnapshot(q);
    expect(data.numChildren()).to.equal(5);
    // data.val().map(x => x.age).map(age => expect(age).to.equal(5));
    expect(helpers.firstRecord(data.val()).age).to.equal(100);
    expect(helpers.lastRecord(data.val()).age).to.equal(100);
    const q2 = Query.path('people').orderByChild('age').limitToLast(5);
    data = await db.getSnapshot(q2);
    expect(data.numChildren()).to.equal(5);
    expect(helpers.firstRecord(data.val()).age).to.equal(1);
    expect(helpers.lastRecord(data.val()).age).to.equal(1);
    const q3 = Query.path('people').orderByChild('age').equalTo(3);
    data = await db.getSnapshot(q3);
    expect(data.numChildren()).to.equal(3);
    expect(helpers.firstRecord(data.val()).age).to.equal(3);
    expect(helpers.lastRecord(data.val()).age).to.equal(3);
  });

  it('getList() works with query passed in', async () => {
    let data = await db.getList<IPerson>('people');
    expect(data.length).to.equal(33); // baseline check

    const q = Query.path('people').orderByChild('age').limitToFirst(5);
    data = await db.getList<IPerson>(q);
    expect(data.length).to.equal(5);
    data.map(d => d.age).map(age => expect(age).to.equal(100));

    const q2 = Query.path('people').orderByChild('age').limitToLast(5);
    data = await db.getList<IPerson>(q2);
    expect(data.length).to.equal(5);
    data.map(d => d.age).map(age => expect(age).to.equal(1));

    const q3 = Query.path('people').orderByChild('age').equalTo(3);
    data = await db.getList<IPerson>(q3);
    expect(data.length).to.equal(3);
    data.map(d => d.age).map(age => expect(age).to.equal(3));
  });
});
