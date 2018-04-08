// tslint:disable:no-implicit-dependencies
import { DB } from "../src/db";
import * as chai from "chai";
import * as helpers from "./testing/helpers";
const expect = chai.expect;

describe("CRUD Testing > ", () => {
  let db: DB;
  beforeEach(() => {
    db = new DB({ mocking: true });
    db.resetMockDb();
  });

  describe("Multi-path operations", () => {
    it("Adding paths is reflected in paths getter", () => {
      const config = db
        .multiPathSet()
        .add({ path: "foofoo", value: "foo" })
        .add({ path: "foobar", value: "bar" })
        .add({ path: "/foobaz", value: "baz" });
      expect(config.paths.length).is.equal(3);
      expect(config.paths).contains("/foofoo");
      expect(config.paths).contains("/foobar");
      expect(config.paths).contains("/foobaz");
    });

    it("Passing in a duplicate path throws error", () => {
      try {
        const config = db
          .multiPathSet()
          .add({ path: "foofoo", value: 1 })
          .add({ path: "foofoo", value: 2 });
        throw new Error("Duplicate path should have thrown error");
      } catch (e) {
        expect(e.code).to.equal("duplicate-path");
      }
    });

    it("Multipath set, sets value at all paths using mock DB", async () => {
      await db
        .multiPathSet()
        .add({ path: "foofoo", value: 1 })
        .add({ path: "foobar", value: 2 })
        .add({ path: "/foo/bar", value: 25 })
        .execute();

      const foofoo = await db.getValue("foofoo");
      const foobar = await db.getValue("foobar");
      const foobar2 = await db.getValue("/foo/bar");

      expect(foobar2).to.equal(25);
      expect(foofoo).to.equal(1);
      expect(foobar).to.equal(2);
    });

    it("Multipath set, sets value at all paths using REAL DB", async () => {
      helpers.setupEnv();
      const db2 = new DB();
      const rndVal = Math.floor(Math.random() * 100);
      const rndVal2 = Math.floor(Math.random() * 100);
      await db2
        .multiPathSet()
        .add({ path: "/foofoo", value: rndVal })
        .add({ path: "/foobar", value: rndVal2 })
        .add({ path: "/foo/bar", value: rndVal2 })
        .execute();

      const foofoo = await db2.getValue("foofoo");
      const foobar = await db2.getValue("foobar");
      const foobar2 = await db2.getValue("foo/bar");

      expect(foofoo).to.equal(rndVal);
      expect(foobar).to.equal(rndVal2);
      expect(foobar2).to.equal(rndVal2);
    });
  });
});
