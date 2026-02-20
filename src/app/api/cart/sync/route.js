import { NextResponse } from 'next/server';
import { pool } from '../../db.js';

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, cartItems } = body;

    if (!userId || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload' },
        { status: 400 }
      );
    }

    // 1. Resolve Identifier (Email or Mobile) to the DB Mobile Primary Key
    const [userRows] = await pool.query(
      'SELECT mobile FROM users WHERE mobile = ? OR email = ?',
      [userId, userId]
    );

    if (userRows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found in database' },
        { status: 404 }
      );
    }

    const dbUserId = userRows[0].mobile;

    // 2. Sync loop using the resolved dbUserId
    for (const item of cartItems) {
      const { product_id, quantity, price } = item;

      // Check if product already exists in database cart for this user
      const [rows] = await pool.query(
        `SELECT id FROM cart WHERE user_id = ? AND product_id = ?`,
        [dbUserId, product_id]
      );

      if (rows.length > 0) {
        // Update existing item
        await pool.query(
          `UPDATE cart 
           SET quantity = quantity + ? 
           WHERE user_id = ? AND product_id = ?`,
          [quantity, dbUserId, product_id]
        );
      } else {
        // Insert new item
        await pool.query(
          `INSERT INTO cart (user_id, product_id, quantity, price)
           VALUES (?, ?, ?, ?)`,
          [dbUserId, product_id, quantity, price]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Cart sync error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}