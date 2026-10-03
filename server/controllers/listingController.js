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
     const [rows] = await pool.query(
      `SELECT
         l.id, l.title, l.description, l.price, l.category,
         l.image_url, l.status, l.created_at, l.seller_id,
         u.name AS seller_name
       FROM listings l
       JOIN users u ON l.seller_id = u.id
       WHERE ${conditions.join(" AND ")}
       ORDER BY l.created_at DESC`,
      values,
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
