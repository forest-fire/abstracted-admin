// tslint:disable:no-implicit-dependencies
import { DB } from "../src";
import * as chai from "chai";
import { SchemaCallback } from "firemock";
import * as helpers from "./testing/helpers";

const expect = chai.expect;

describe("Connecting to Database", () => {
  it("can not instantiate without setting FIREBASE_SERVICE_ACCOUNT and FIREBASE_DATA_ROOT_URL", () => {
    try {
      const db = new DB();
      expect(true).to.equal(false);
    } catch (e) {
      expect(true).to.equal(true);
    }
  });

  it("once ENV is setup, can instantiate", () => {
    helpers.setupEnv();
    const db = new DB();
    expect(true).to.equal(true);
  });

  it("can get a value from database once waitForConnection() returns", async () => {
    const db = new DB();
    expect(db.isConnected).to.be.a("boolean");
    await db.waitForConnection();
    expect(db.isConnected).to.equal(true);
    const connected = await db.getValue<boolean>(".info/connected");
    expect(connected).to.equal(true);
  });
});

describe("Write Operations", () => {
  helpers.setupEnv();
  const db = new DB();
  afterEach(async () => {
    await db.remove("scratch");
  });

  interface INameAndAge {
    name: string;
    age: number;
  }

  it("push() variables into database", async () => {
    await db.push<INameAndAge>("scratch/pushed", {
      name: "Charlie",
      age: 25
    });
    await db.push("scratch/pushed", {
      name: "Sandy",
      age: 32
    });
    const users = await db.getValue("scratch/pushed");
    expect(Object.keys(users).length).to.equal(2);
    expect(helpers.valuesOf(users, "name")).to.include("Charlie");
    expect(helpers.valuesOf(users, "name")).to.include("Sandy");
  });

  it("set() sets data at a given path in DB", async () => {
    await db.set<INameAndAge>("scratch/set/user", {
      name: "Charlie",
      age: 25
    });
    const user = await db.getValue<INameAndAge>("scratch/set/user");
    expect(user.name).to.equal("Charlie");
    expect(user.age).to.equal(25);
  });

  it('update() can "set" and then "update" contents', async () => {
    await db.update("scratch/update/user", {
      name: "Charlie",
      age: 25
    });
    let user = await db.getValue<INameAndAge>("scratch/update/user");
    expect(user.name).to.equal("Charlie");
    expect(user.age).to.equal(25);
    await db.update("scratch/update/user", {
      name: "Charles",
      age: 34
    });
    user = await db.getValue<INameAndAge>("scratch/update/user");
    expect(user.name).to.equal("Charles");
    expect(user.age).to.equal(34);
  });

  it("update() leaves unchanged attributes as they were", async () => {
    await db.update("scratch/update/user", {
      name: "Rodney",
      age: 25
    });
    let user = await db.getValue<INameAndAge>("scratch/update/user");
    expect(user.name).to.equal("Rodney");
    expect(user.age).to.equal(25);
    await db.update("scratch/update/user", {
      age: 34
    });
    user = await db.getValue<INameAndAge>("scratch/update/user");
    expect(user.name).to.equal("Rodney");
    expect(user.age).to.equal(34);
  });

  it("remove() eliminates a path -- and all children -- in DB", async () => {
    await db.set("scratch/removal/user", {
      name: "Rodney",
      age: 25
    });
    let user = await db.getValue<INameAndAge>("scratch/removal/user");
    expect(user.name).to.equal("Rodney");
    await db.remove("scratch/removal/user");
    user = await db.getValue<INameAndAge>("scratch/removal/user");
    expect(user).to.equal(null);
  });
});

describe("Other Operations", () => {
  helpers.setupEnv();
  const db = new DB();
  afterEach(async () => {
    await db.remove("scratch");
  });

  it("exists() tests to true/false based on existance of data", async () => {
    await db.set("/scratch/existance", "foobar");
    let exists = await db.exists("/scratch/existance");
    expect(exists).to.equal(true);
    await db.remove("/scratch/existance");
    exists = await db.exists("/scratch/existance");
    expect(exists).to.equal(false);
  });
});
