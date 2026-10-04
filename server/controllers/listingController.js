import pool from "../config/db.js";
export const createListing = async (req, res) => {
  try {
    const seller_id = req.user.id;
    const { title, description, price, category, image_url } = req.body ?? {};

    if (typeof title !== "string") {
      return res.status(400).json({
        success: false,
        message: "Title is required and must be text",
      });
    }

    const normalizedTitle = title.trim();
    if (normalizedTitle.length < 3 || normalizedTitle.length > 120) {
      return res.status(400).json({
        success: false,
        message: "Title must be between 3 and 120 characters",
      });
    }

    if (
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0 ||
      price > 99999999.99
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a number between 0 and 99,999,999.99",
      });
    }

    for (const [name, value] of Object.entries({
      description,
      category,
      image_url,
    })) {
      if (value !== undefined && typeof value !== "string") {
        return res.status(400).json({
          success: false,
          message: `${name} must be text`,
        });
      }
    }

    if (category && category.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Category must be 50 characters or fewer",
      });
    }
    if (image_url && image_url.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Image URL must be 255 characters or fewer",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO listings (seller_id, title, description, price, category, image_url) VALUES ( ? , ?, ?, ?, ?, ? )",
      [
        seller_id,
        normalizedTitle,
        description ?? null,
        price,
        category ?? null,
        image_url ?? null,
      ],
    );

    const [rows] = await pool.query(
      "SELECT * FROM listings WHERE id = ? AND seller_id = ?",
      [result.insertId, seller_id],
    );
    res.status(201).json({
      success: true,
      message: "Listing successfully created",
      data: rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getListings = async (req, res) => {
  try {
    const { search, category } = req.query;

    const rawPage = Number(req.query.page);
    const rawLimit = Number(req.query.limit);

    const page = Number.isInteger(rawPage) ? Math.max(rawPage, 1) : 1;
    const limit = Number.isInteger(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), 50)
      : 12;
    const offset = (page - 1) * limit;

    const conditions = ["l.status = 'available'"];
    const values = [];

    if (typeof search === "string" && search.trim()) {
      conditions.push("l.title LIKE ?");
      values.push(`%${search.trim()}%`);
    }

    if (typeof category === "string" && category.trim()) {
      conditions.push("l.category = ?");
      values.push(category.trim());
    }

    const where = conditions.join(" AND ");

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM listings l WHERE ${where}`,
      values,
    );
    const total = Number(countRows[0].total);

    const [rows] = await pool.query(
      `SELECT
         l.id, l.title, l.description, l.price, l.category,
         l.image_url, l.status, l.created_at, l.seller_id,
         u.name AS seller_name
       FROM listings l
       JOIN users u ON l.seller_id = u.id
       WHERE ${where}
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset],
    );

    res.status(200).json({
      success: true,
      data: rows,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getListingById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const validId = Number.isInteger(id) && id > 0;

    if (!validId) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing id",
      });
    }
    const [rows] = await pool.query(
      `SELECT
         l.id, l.title, l.description, l.price, l.category,
         l.image_url, l.status, l.created_at, l.seller_id,
         u.name AS seller_name
       FROM listings l
       JOIN users u ON l.seller_id = u.id
       WHERE l.id = ?`,
      [id],
    );
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }
    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateListing = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description, price, category, image_url, status } =
      req.body ?? {};
    const validId = Number.isInteger(id) && id > 0;
    const allowedStatus = ["available", "sold"];

    if (!validId) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing id",
      });
    }
    const [rows] = await pool.query(
      "SELECT id, seller_id FROM listings WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    if (rows[0].seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action",
      });
    }

    if (typeof title !== "string") {
      return res.status(400).json({
        success: false,
        message: "Title is required and must be text",
      });
    }

    const normalizedTitle = title.trim();
    if (normalizedTitle.length < 3 || normalizedTitle.length > 120) {
      return res.status(400).json({
        success: false,
        message: "Title must be between 3 and 120 characters",
      });
    }

    if (
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0 ||
      price > 99999999.99
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a number between 0 and 99,999,999.99",
      });
    }

    for (const [name, value] of Object.entries({
      description,
      category,
      image_url,
    })) {
      if (value !== undefined && typeof value !== "string") {
        return res.status(400).json({
          success: false,
          message: `${name} must be text`,
        });
      }
    }

    if (category && category.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Category must be 50 characters or fewer",
      });
    }
    if (image_url && image_url.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Image URL must be 255 characters or fewer",
      });
    }
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }
    const [result] = await pool.query(
      "UPDATE listings SET title = ?, description = ?, price = ?, category = ?, image_url = ?, status = ? WHERE id = ? AND seller_id = ?",
      [
        normalizedTitle,
        description ?? null,
        price,
        category ?? null,
        image_url ?? null,
        status,
        id,
        req.user.id,
      ],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }
    const [updatedRows] = await pool.query(
      "SELECT * FROM listings WHERE id = ?",
      [id],
    );

    res.status(200).json({
      success: true,
      message: "Listing updated successfully",
      data: updatedRows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const validId = Number.isInteger(id) && id > 0;

    if (!validId) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing id",
      });
    }
    const [rows] = await pool.query(
      "SELECT id, seller_id FROM listings WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }
    if (rows[0].seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action",
      });
    }
    const [result] = await pool.query(
      "DELETE FROM listings WHERE id = ? AND seller_id = ?",
      [id, req.user.id],
    );
    res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        success: false,
        message: "This listing has conversations. Mark it as sold instead.",
      });
    }
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
