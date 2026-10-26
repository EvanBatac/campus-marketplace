import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { register } from "../controllers/authController.js";

test("registration enforces the UTF-8 bcrypt boundary before database access", async (t) => {
  const originalQuery = pool.query;
  t.after(() => {
    pool.query = originalQuery;
  });

  for (const password of ["a".repeat(73), "é".repeat(37), "😀".repeat(19)]) {
    pool.query = async () => {
      assert.fail("Oversized password reached database");
    };
    const res = response();
    await register(
      { body: { name: "Student", email: "student@example.com", password } },
      res,
    );
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /72 UTF-8 bytes/);
  }

  for (const password of ["a".repeat(72), "é".repeat(36), "😀".repeat(18)]) {
    let storedHash;
    pool.query = async (sql, values) => {
      if (sql.startsWith("SELECT")) return [[]];
      storedHash = values[2];
      return [{ insertId: 1 }];
    };
    const res = response();
    await register(
      { body: { name: "Student", email: "student@example.com", password } },
      res,
    );
    assert.equal(res.statusCode, 201);
    assert.ok(await bcrypt.compare(password, storedHash));
  }
});

function response() {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}
