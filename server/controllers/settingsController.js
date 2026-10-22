import bcrypt from "bcrypt";
import pool from "../config/db.js";

export async function updateProfile(req, res) {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (name.length < 2 || name.length > 100) {
    return res
      .status(400)
      .json({ message: "Name must be between 2 and 100 characters" });
  }
  try {
    await pool.query("UPDATE users SET name = ? WHERE id = ?", [
      name,
      req.user.id,
    ]);
    const [rows] = await pool.query(
      "SELECT id, name, email FROM users WHERE id = ?",
      [req.user.id],
    );
    if (!rows.length)
      return res.status(404).json({ message: "User not found" });
    return res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error("Profile update failed:", error.message);
    return res
      .status(500)
      .json({ message: "Unable to update your profile. Please try again." });
  }
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body ?? {};
  if (
    typeof currentPassword !== "string" ||
    !currentPassword ||
    typeof newPassword !== "string" ||
    newPassword.length < 8
  ) {
    return res
      .status(400)
      .json({
        message:
          "Enter your current password and a new password of at least 8 characters",
      });
  }
  if (Buffer.byteLength(newPassword, "utf8") > 72) {
    return res
      .status(400)
      .json({ message: "New password must be 72 UTF-8 bytes or fewer" });
  }
  if (currentPassword === newPassword) {
    return res
      .status(400)
      .json({
        message: "Choose a password different from your current password",
      });
  }
  try {
    const [rows] = await pool.query(
      "SELECT password_hash FROM users WHERE id = ?",
      [req.user.id],
    );
    if (!rows.length)
      return res.status(404).json({ message: "User not found" });
    const previousHash = rows[0].password_hash;
    if (!(await bcrypt.compare(currentPassword, previousHash))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.query(
      "UPDATE users SET password_hash = ? WHERE id = ? AND password_hash = ?",
      [hash, req.user.id, previousHash],
    );
    if (!result.affectedRows) {
      return res
        .status(409)
        .json({
          message:
            "Your password changed during this request. Please try again.",
        });
    }
    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Password change failed:", error.message);
    return res
      .status(500)
      .json({ message: "Unable to change your password. Please try again." });
  }
}
