import { DB } from "../src/index";
// tslint:disable-next-line:no-implicit-dependencies
import * as chai from "chai";
import * as helpers from "./testing/helpers";
const expect = chai.expect;
helpers.setupEnv();
type SchemaCallback = import("firemock").SchemaCallback;

const animalMocker: SchemaCallback = h => () => ({
  type: h.faker.random.arrayElement(["cat", "dog", "parrot"]),
  name: h.faker.name.firstName(),
  age: h.faker.random.number({ min: 1, max: 15 })
});

describe("Mocking", async () => {
  it("ref() returns a mock reference", async () => {
    const db = new DB();
    await db.waitForConnection();
    expect(db.ref("foo")).to.have.property("once");
    const mockDb = await DB.connect({ mocking: true });
    await mockDb.waitForConnection();
    expect(mockDb.ref("foo")).to.have.property("once");
  });

  it("getSnapshot() returns a mock snapshot", async () => {
    const db = await DB.connect({ mocking: true });
    await db.waitForConnection();
    addAnimals(db, 10);
    const animals = await db.getSnapshot("/animals");
    expect(animals.numChildren()).to.equal(10);
    db.mock.queueSchema("animal", 5).generate();
    const moreAnimals = await db.getSnapshot("/animals");
    expect(moreAnimals.numChildren()).to.equal(15);
  });

  it("getValue() returns a value from mock DB", async () => {
    const db = await DB.connect({ mocking: true });
    await db.waitForConnection();
    addAnimals(db, 10);
    const animals = await db.getValue("/animals");
    expect(animals).to.be.an("object");
    expect(helpers.length(animals)).to.equal(10);
    expect(helpers.firstRecord(animals)).to.have.property("id");
    expect(helpers.firstRecord(animals)).to.have.property("name");
    expect(helpers.firstRecord(animals)).to.have.property("age");
  });

  it("getRecord() returns a record from mock DB", async () => {
    const db = await DB.connect({ mocking: true });
    addAnimals(db, 10);
    const firstKey = helpers.firstKey(db.mock.db.animals);
    const animal = await db.getRecord(`/animals/${firstKey}`);
    expect(animal).to.be.an("object");
    expect(animal.id).to.equal(firstKey);
    expect(animal).to.have.property("name");
    expect(animal).to.have.property("age");
  });

  it("getRecord() returns a record from mock DB with bespoke id prop", async () => {
    const db = await DB.connect({ mocking: true });
    addAnimals(db, 10);
    const firstKey = helpers.firstKey(db.mock.db.animals);
    const animal = await db.getRecord(`/animals/${firstKey}`, "key");

    expect(animal).to.be.an("object");
    expect(animal).to.have.property("key");
    expect(animal).to.have.property("name");
    expect(animal).to.have.property("age");
  });

  it("getList() returns an array of records", async () => {
    const db = await DB.connect({ mocking: true });
    addAnimals(db, 10);
    const animals = await db.getList("/animals");
    expect(animals).to.be.an("array");
    expect(animals).has.lengthOf(10);
    expect(animals[0]).to.have.property("id");
    expect(animals[0]).to.have.property("name");
    expect(animals[0]).to.have.property("age");
  });

  it('getList() returns an array of records, with bespoke "id" property', async () => {
    const db = new DB({ mocking: true });
    await db.waitForConnection();
    addAnimals(db, 10);
    const animals = await db.getList("/animals", "key");
    expect(animals).to.be.an("array");
    expect(animals).has.lengthOf(10);
    expect(animals[0]).to.have.property("key");
    expect(animals[0]).to.have.property("name");
    expect(animals[0]).to.have.property("age");
  });

  it("set() sets to the mock DB", async () => {
    const db = new DB({ mocking: true });
    await db.waitForConnection();
    db.set("/people/abcd", {
      name: "Frank Black",
      age: 45
    });
    const people = await db.getRecord("/people/abcd");
    expect(people).to.have.property("id");
    expect(people).to.have.property("name");
    expect(people).to.have.property("age");
  });

  it("update() updates the mock DB", async () => {
    const db = new DB({ mocking: true });
    await db.waitForConnection();
    db.mock.updateDB({
      people: {
        abcd: {
          name: "Frank Black",
          age: 45
        }
      }
    });
    db.update("/people/abcd", { age: 14 });
    const people = await db.getRecord("/people/abcd");
    expect(people).to.be.an("object");
    expect(people).to.have.property("id");
    expect(people).to.have.property("name");
    expect(people).to.have.property("age");
    expect(people.name).to.equal("Frank Black");
    expect(people.age).to.equal(14);
  });

  it("push() pushes records into the mock DB", async () => {
    const db = new DB({ mocking: true });
    await db.waitForConnection();
    db.push("/people", {
      name: "Frank Black",
      age: 45
    });
    const people = await db.getList("/people");
    expect(people).to.be.an("array");
    expect(people).has.lengthOf(1);
    expect(helpers.firstRecord(people)).to.have.property("id");
    expect(helpers.firstRecord(people)).to.have.property("name");
    expect(helpers.firstRecord(people)).to.have.property("age");
    expect(helpers.firstRecord(people).age).to.equal(45);
  });

  it("read operations on mock with a schema prefix are offset correctly", async () => {
    const db = new DB({ mocking: true });
    await db.waitForConnection();
    db.mock
      .addSchema("meal", h => () => ({
        name: h.faker.random.arrayElement(["breakfast", "lunch", "dinner"]),
        datetime: h.faker.date.recent()
      }))
      .pathPrefix("authenticated");
    db.mock.queueSchema("meal", 10);
    db.mock.generate();

    expect(db.mock.db.authenticated).to.be.an("object");
    expect(db.mock.db.authenticated.meals).to.be.an("object");
    const list = await db.getList("/authenticated/meals");
    expect(list.length).to.equal(10);
  });
});

function addAnimals(db: DB, count: number) {
  db.mock.addSchema("animal", animalMocker as any);
  db.mock.queueSchema("animal", count);
  db.mock.generate();
}
