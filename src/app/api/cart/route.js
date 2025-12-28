import { NextResponse } from 'next/server';
import { pool } from '../db.js';

// ✅ Get cart items by user
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    const [rows] = await pool.query(
      'SELECT c.*, p.title, p.price, p.images FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?',
      [user_id]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// ✅ Add item to cart
export async function POST(req) {
  try {
    const { user_id, product_id, quantity } = await req.json();

    // Check if exists
    const [exist] = await pool.query(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );

    if (exist.length > 0) {
      await pool.query(
        'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
        [quantity, user_id, product_id]
      );
    } else {
      await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity, created_at) VALUES (?, ?, ?, NOW())',
        [user_id, product_id, quantity]
      );
    }

    return NextResponse.json({ message: 'Item added to cart' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

// ✅ Remove item
export async function DELETE(req) {
  try {
    const { user_id, product_id } = await req.json();
    await pool.query('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [user_id, product_id]);
    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}
