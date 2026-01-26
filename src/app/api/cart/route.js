import { NextResponse } from 'next/server';
import { pool } from '../db.js';

// GET: fetch cart
export async function GET(req) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId)
      return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 });

    const [rows] = await pool.query(
      'SELECT product_id, quantity, price FROM cart WHERE user_id = ?',
      [userId]
    );

    const cartItems = await Promise.all(
      rows.map(async (item) => {
        const [prod] = await pool.query('SELECT title, images FROM products WHERE id = ?', [
          item.product_id,
        ]);
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          price: parseFloat(item.price),
          title: prod[0]?.title || 'Unknown Product',
          images: prod[0]?.images || [],
        };
      })
    );

    return NextResponse.json({ success: true, cartItems });
  } catch (err) {
    console.error('GET cart error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// POST: add to cart
export async function POST(req) {
  try {
    const { userId, product } = await req.json();
    if (!userId || !product?.product_id)
      return NextResponse.json({ success: false, message: 'User & product required' }, { status: 400 });

    // Check if product exists
    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, product.product_id]
    );

    if (existing.length) {
      await pool.query('UPDATE cart SET quantity = ? WHERE id = ?', [
        existing[0].quantity + (product.quantity || 1),
        existing[0].id,
      ]);
    } else {
      await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity, price, created_at) VALUES (?, ?, ?, ?, NOW())',
        [userId, product.product_id, product.quantity || 1, product.price]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST cart error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Server error' }, { status: 500 });
  }
}

// PUT: update quantity
export async function PUT(req) {
  try {
    const { userId, productId, quantity } = await req.json();
    if (!userId || !productId || quantity == null)
      return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });

    if (quantity <= 0) {
      await pool.query('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId]);
    } else {
      await pool.query('UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?', [
        quantity,
        userId,
        productId,
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PUT cart error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Server error' }, { status: 500 });
  }
}

// DELETE: remove item
export async function DELETE(req) {
  try {
    const { userId, productId } = await req.json();
    if (!userId || !productId)
      return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });

    await pool.query('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE cart error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Server error' }, { status: 500 });
  }
}
