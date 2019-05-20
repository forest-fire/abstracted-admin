// tslint:disable:no-implicit-dependencies
import * as chai from "chai";
import * as helpers from "./testing/helpers";
import { DB } from "../src";

describe("mockData", () => {
  it("mockData option initializes a mock database state", async () => {
    const db = await DB.connect({
      mocking: true,
      mockData: {
        people: {
          1234: {
            name: "Foobar"
          }
        }
      }
    });
  });
});
