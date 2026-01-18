import { NextResponse } from 'next/server';
import { pool } from '../../db.js'; // relative path from route.js to db.js

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, cartItems } = body;

    // console.log('SYNC CART:', body);

    if (!userId || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload' },
        { status: 400 }
      );
    }

    for (const item of cartItems) {
      const { product_id, quantity, price } = item;

      const [rows] = await pool.query(
        `SELECT id FROM cart WHERE user_id = ? AND product_id = ?`,
        [userId, product_id]
      );

      if (rows.length > 0) {
        await pool.query(
          `UPDATE cart 
           SET quantity = quantity + ? 
           WHERE user_id = ? AND product_id = ?`,
          [quantity, userId, product_id]
        );
      } else {
        await pool.query(
          `INSERT INTO cart (user_id, product_id, quantity, price)
           VALUES (?, ?, ?, ?)`,
          [userId, product_id, quantity, price]
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
