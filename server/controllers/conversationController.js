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

export const getMessages = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const isValidId = Number.isInteger(id) && id > 0;

    if (!isValidId) {
      return res.status(400).json({
        success: false,
        message: "Invalid id",
      });
    }
    const [conversationRows] = await pool.query(
      "SELECT id, buyer_id, seller_id FROM conversations WHERE id = ?",
      [id],
    );
    if (conversationRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }
    const conversation = conversationRows[0];
    if (
      conversation.seller_id !== req.user.id &&
      conversation.buyer_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action",
      });
    }
    const [messageRows] = await pool.query(
      "SELECT id, conversation_id, sender_id, body, read_at, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC, id ASC",
      [id],
    );
    res.status(200).json({
      success: true,
      data: messageRows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const markConversationRead = async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    const userId = req.user.id;
    const isValidId = Number.isInteger(conversationId) && conversationId > 0;

    if (!isValidId) {
      return res.status(400).json({
        success: false,
        message: "Invalid id",
      });
    }
    const [conversationRows] = await pool.query(
      "SELECT id, buyer_id, seller_id FROM conversations WHERE id = ?",
      [conversationId],
    );
    if (conversationRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }
    const conversation = conversationRows[0];
    if (
      conversation.seller_id !== userId &&
      conversation.buyer_id !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action",
      });
    }
    await pool.query(
      "UPDATE messages SET read_at = NOW() WHERE conversation_id = ? AND sender_id <> ? AND read_at IS NULL",
      [conversationId, userId],
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMyConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT c.id, c.listing_id, c.buyer_id, c.seller_id, c.created_at,
          l.title AS listing_title,
          u.id AS other_user_id,
          u.name AS other_user_name,
          (SELECT COUNT(*)
           FROM messages m2
           WHERE m2.conversation_id = c.id
             AND m2.read_at IS NULL
             AND m2.sender_id <> ?) AS unread_count
   FROM conversations c
   JOIN listings l ON l.id = c.listing_id
   JOIN users u ON u.id = IF(c.buyer_id = ?, c.seller_id, c.buyer_id)
   WHERE ( c.buyer_id = ? OR c.seller_id = ? ) AND EXISTS (
     SELECT 1 FROM messages m WHERE m.conversation_id = c.id
   )
   ORDER BY c.created_at DESC`,
      [userId, userId, userId, userId],
    );

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
