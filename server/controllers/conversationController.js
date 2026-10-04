import pool from "../config/db.js";

export const startConversation = async (req, res) => {
  try {
    const buyer_id = req.user.id;
    const { listing_id: rawListingId } = req.body ?? {};
    const listing_id = Number(rawListingId);

    const validListingId = Number.isInteger(listing_id) && listing_id > 0;

    if (!validListingId) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing id",
      });
    }
    const [listingRows] = await pool.query(
      "SELECT id, seller_id FROM listings WHERE id = ?",
      [listing_id],
    );
    if (listingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }
    if (buyer_id === listingRows[0].seller_id) {
      return res.status(400).json({
        success: false,
        message: "You can't message yourself",
      });
    }

    const [existingRows] = await pool.query(
      "SELECT id, listing_id, buyer_id, seller_id, created_at FROM conversations WHERE listing_id = ? AND buyer_id = ?",
      [listing_id, buyer_id],
    );
    if (existingRows.length > 0) {
      return res.status(200).json({
        success: true,
        data: existingRows[0],
      });
    }
    let result;
    try {
      [result] = await pool.query(
        "INSERT INTO conversations (listing_id, buyer_id, seller_id) VALUES (?, ?, ?)",
        [listing_id, buyer_id, listingRows[0].seller_id],
      );
    } catch (insertError) {
      if (insertError.code === "ER_DUP_ENTRY") {
        const [duplicateRows] = await pool.query(
          "SELECT id, listing_id, buyer_id, seller_id, created_at FROM conversations WHERE listing_id = ? AND buyer_id = ?",
          [listing_id, buyer_id],
        );
        return res.status(200).json({
          success: true,
          data: duplicateRows[0],
        });
      }
      throw insertError;
    }

    const [createdRows] = await pool.query(
      "SELECT id, listing_id, buyer_id, seller_id, created_at FROM conversations WHERE id = ?",
      [result.insertId],
    );

    res.status(201).json({
      success: true,
      message: "Conversation created",
      data: createdRows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
