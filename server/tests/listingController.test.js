import test from "node:test";
import assert from "node:assert/strict";
import pool from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import { createListing } from "../controllers/listingController.js";

test("listing creation transaction and upload compensation", async (t) => {
  const originalConnection = pool.getConnection;
  const originalUpload = cloudinary.uploader.upload_stream;
  const originalDestroy = cloudinary.uploader.destroy;
  t.after(() => {
    pool.getConnection = originalConnection;
    cloudinary.uploader.upload_stream = originalUpload;
    cloudinary.uploader.destroy = originalDestroy;
  });

  for (const scenario of [
    "success",
    "upload-failure",
    "connection-failure",
    "listing-failure",
    "images-failure",
    "select-failure",
    "commit-failure",
    "cleanup-failure",
  ]) {
    await t.test(scenario, async () => {
      const operations = [];
      const deleted = [];
      let uploadIndex = 0;
      cloudinary.uploader.upload_stream = (_options, callback) => {
        const index = uploadIndex++;
        return {
          end() {
            setTimeout(
              () => {
                operations.push(`upload:${index}`);
                if (scenario === "upload-failure" && index === 0)
                  callback(new Error("Upload failed"));
                else
                  callback(null, {
                    secure_url: `https://images/${index}`,
                    public_id: `image-${index}`,
                  });
              },
              index === 0 ? 0 : 10,
            );
          },
        };
      };
      cloudinary.uploader.destroy = async (id) => {
        deleted.push(id);
        if (scenario === "cleanup-failure" && id === "image-0")
          throw new Error("Cleanup failed");
        return { result: "ok" };
      };
      pool.getConnection = async () => {
        operations.push("connection");
        if (scenario === "connection-failure")
          throw new Error("Connection failed");
        return {
          async beginTransaction() {
            operations.push("begin");
          },
          async query(sql, values) {
            const step = sql.startsWith("SELECT")
              ? "select"
              : sql.includes("listing_images")
                ? "images"
                : "listing";
            operations.push(step);
            if (
              scenario === `${step}-failure` ||
              (scenario === "cleanup-failure" && step === "images")
            )
              throw new Error("Query failed");
            if (step === "listing") {
              assert.equal(values[5], "https://images/0");
              return [{ insertId: 42 }];
            }
            if (step === "images")
              assert.deepEqual(
                values[0].map((row) => row[3]),
                [0, 1],
              );
            return step === "select" ? [[{ id: 42 }]] : [{}];
          },
          async commit() {
            operations.push("commit");
            if (scenario === "commit-failure") throw new Error("Commit failed");
          },
          async rollback() {
            operations.push("rollback");
          },
          release() {
            operations.push("release");
          },
        };
      };
      const res = {
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
      await createListing(
        {
          user: { id: 1 },
          body: { title: "Textbook", price: "100", category: "books" },
          files: [
            { buffer: Buffer.from("first") },
            { buffer: Buffer.from("second") },
          ],
        },
        res,
      );
      assert.equal(res.statusCode, scenario === "success" ? 201 : 500);
      if (scenario === "success") {
        assert.deepEqual(deleted, []);
        assert.deepEqual(operations.slice(2), [
          "connection",
          "begin",
          "listing",
          "images",
          "select",
          "commit",
          "release",
        ]);
      } else {
        assert.deepEqual(
          deleted.sort(),
          scenario === "upload-failure" ? ["image-1"] : ["image-0", "image-1"],
        );
        if (scenario === "upload-failure")
          assert.ok(!operations.includes("connection"));
        else if (scenario !== "connection-failure") {
          assert.ok(operations.includes("rollback"));
          assert.equal(operations.at(-1), "release");
        }
      }
    });
  }
});
