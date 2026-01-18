import { NextResponse } from 'next/server';
import { pool } from '../db.js'; // relative path

export async function GET(req) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const [rows] = await pool.query(
      `SELECT product_id, quantity, price 
       FROM cart WHERE user_id = ?`,
      [userId]
    );

    // Add title and images if you have products table
    const cartItems = await Promise.all(rows.map(async (item) => {
      const [prod] = await pool.query(
        `SELECT title, images FROM products WHERE id = ?`,
        [item.product_id]
      );

      return {
        product_id: item.product_id,
        quantity: item.quantity,
        price: parseFloat(item.price),
        title: prod[0]?.title || 'Unknown Product',
        images: prod[0]?.images || [],
      };
    }));

    return NextResponse.json({ success: true, cartItems });
  } catch (err) {
    console.error('Fetch cart error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
