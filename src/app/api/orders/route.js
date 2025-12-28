import { NextResponse } from 'next/server';
import { pool } from '../db.js';

// ✅ Get orders for user
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC',
      [user_id]
    );

    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// ✅ Place new order
export async function POST(req) {
  try {
    const { user_id, items, total_amount, payment_method, shipping_address } = await req.json();

    // Create order
    const [orderResult] = await pool.query(
      'INSERT INTO orders (user_id, total_amount, payment_method, shipping_address, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [user_id, total_amount, payment_method, shipping_address, 'Pending']
    );

    const order_id = orderResult.insertId;

    // Insert order items
    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [order_id, item.product_id, item.quantity, item.price]
      );
    }

    // Clear cart
    await pool.query('DELETE FROM cart WHERE user_id = ?', [user_id]);

    return NextResponse.json({ message: 'Order placed successfully', order_id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}
