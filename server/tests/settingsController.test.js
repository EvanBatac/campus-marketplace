import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import {
  updateProfile,
  changePassword,
} from "../controllers/settingsController.js";

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

test("account settings controllers", async (t) => {
  const originalQuery = pool.query;
  t.after(() => {
    pool.query = originalQuery;
  });
  const hash = await bcrypt.hash("original-password", 4);

  await t.test("invalid profile never writes to the database", async () => {
    pool.query = async () => {
      assert.fail("Unexpected database call");
    };
    const res = response();
    await updateProfile({ user: { id: 5 }, body: { name: " " } }, res);
    assert.equal(res.statusCode, 400);
  });

  await t.test(
    "profile updates are trimmed and restricted to the authenticated user",
    async () => {
      const calls = [];
      pool.query = async (sql, values) => {
        calls.push({ sql, values });
        return sql.startsWith("UPDATE")
          ? [{ affectedRows: 1 }]
          : [[{ id: 5, name: "New Name", email: "a@example.com" }]];
      };
      const res = response();
      await updateProfile(
        { user: { id: 5 }, body: { id: 99, name: " New Name " } },
        res,
      );
      assert.deepEqual(calls[0].values, ["New Name", 5]);
      assert.equal(res.body.user.name, "New Name");
      assert.equal(res.body.user.password_hash, undefined);
    },
  );

  await t.test(
    "short, identical, and oversized passwords are rejected before database access",
    async () => {
      pool.query = async () => {
        assert.fail("Unexpected database call");
      };
      for (const newPassword of [
        "short",
        "original-password",
        "é".repeat(37),
      ]) {
        const res = response();
        await changePassword(
          {
            user: { id: 5 },
            body: { currentPassword: "original-password", newPassword },
          },
          res,
        );
        assert.equal(res.statusCode, 400);
      }
    },
  );

  await t.test(
    "incorrect current password never changes the stored password",
    async () => {
      pool.query = async (sql) => {
        assert.ok(sql.startsWith("SELECT"));
        return [[{ password_hash: hash }]];
      };
      const res = response();
      await changePassword(
        {
          user: { id: 5 },
          body: {
            currentPassword: "incorrect",
            newPassword: "replacement-password",
          },
        },
        res,
      );
      assert.equal(res.statusCode, 400);
    },
  );

  await t.test(
    "password changes store a new hash and guard against concurrent changes",
    async () => {
      pool.query = async (sql, values) => {
        if (sql.startsWith("SELECT")) return [[{ password_hash: hash }]];
        assert.equal(values[1], 5);
        assert.equal(values[2], hash);
        assert.notEqual(values[0], "replacement-password");
        assert.equal(
          await bcrypt.compare("replacement-password", values[0]),
          true,
        );
        return [{ affectedRows: 1 }];
      };
      const res = response();
      await changePassword(
        {
          user: { id: 5 },
          body: {
            currentPassword: "original-password",
            newPassword: "replacement-password",
          },
        },
        res,
      );
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
    },
  );

  await t.test("a concurrent password change returns a conflict", async () => {
    pool.query = async (sql) =>
      sql.startsWith("SELECT")
        ? [[{ password_hash: hash }]]
        : [{ affectedRows: 0 }];
    const res = response();
    await changePassword(
      {
        user: { id: 5 },
        body: {
          currentPassword: "original-password",
          newPassword: "replacement-password",
        },
      },
      res,
    );
    assert.equal(res.statusCode, 409);
  });
});
