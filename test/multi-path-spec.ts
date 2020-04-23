// tslint:disable:no-implicit-dependencies
import { DB } from "../src/db";
import * as chai from "chai";
import * as helpers from "./testing/helpers";
import { IDictionary } from "common-types";
const expect = chai.expect;

describe("CRUD Testing > ", () => {
  let db: DB;
  beforeEach(async () => {
    db = new DB({ mocking: true });
    await db.waitForConnection();
  });

  describe("Multi-path operations", () => {
    it("Adding unprefixed paths is reflected in paths getter", async () => {
      await db.multiPathSet({
        foofoo: "foo",
        foobar: "bar",
        foobaz: "baz"
      });
      console.log(db.mock.db);

      expect(Object.keys(db.mock.db).length).to.equal(3);
      expect(Object.keys(db.mock.db)).contains("foofoo");
      expect(Object.keys(db.mock.db)).contains("foobar");
      expect(Object.keys(db.mock.db)).contains("foobaz");
    });

    it("sets value at all paths using mock DB", async () => {
      const updates = {
        "/foofoo": 1,
        "/foobar": 2,
        "/foo/bar": 25
      };

      await db.multiPathSet(updates);
      console.log(db.mock.db);

      const foofoo = await db.getValue("/foofoo");
      const foobar = await db.getValue("/foobar");
      const foobar2 = await db.getValue("/foo/bar");

      expect(foofoo).to.equal(1);
      expect(foobar).to.equal(2);
      expect(foobar2).to.equal(25);
    });
  });
});
