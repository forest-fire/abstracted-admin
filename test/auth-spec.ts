// tslint:disable:no-implicit-dependencies
import { DB } from "../src/";
import * as helpers from "./testing/helpers";
import { expect } from "chai";
import { auth } from "firebase-admin";
helpers.setupEnv();

describe("Admin Auth API", () => {
  it("before connecting throws error", async () => {
    const db = new DB();
    try {
      const fail = await db.auth();
      throw new Error("Should have failed");
    } catch (e) {
      expect(
        e.code,
        `Expected error code to be "not-ready" [ ${e.message} ]`
      ).to.equal("not-ready");
    }
  });

  it("after connecting can reference auth", async () => {
    const db = await DB.connect();
    const success: auth.Auth = await db.auth();
    expect(success).to.be.an("object");
    expect(success.createCustomToken).to.be.a("function");
  });
});
