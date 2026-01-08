// src/app/api/orders/route.js
import { NextResponse } from 'next/server';
import { pool } from '../db.js';

/**
 * Helper to generate unique order number
 */
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD${timestamp}${random}`;
};

/**
 * GET /api/orders?user_id=...&mobile=...
 * Fetch orders by user_id or mobile
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');
    const mobile = searchParams.get('mobile');

    let query = 'SELECT * FROM orders';
    const params = [];

    if (user_id) {
      query += ' WHERE user_id = ?';
      params.push(user_id);
    } else if (mobile) {
      query += ' WHERE mobile = ?';
      params.push(mobile);
    }

    query += ' ORDER BY id DESC';

    const [orders] = await pool.query(query, params);

    // Optional: fetch items for each order
    for (let order of orders) {
      const [items] = await pool.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      );
      order.items = items;
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

/**
 * POST /api/orders
 * Place a new order
 * body: { user_id, mobile, items, total_amount, payment_method, shipping_address }
 */
export async function POST(req) {
  try {
    const { user_id, mobile, items, total_amount, payment_method, shipping_address } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();
    const paymentStatus = payment_method === 'cod' ? 'pending' : 'paid';
    const orderStatus = 'pending';

    // Insert order
    const [orderResult] = await pool.query(
      `INSERT INTO orders 
        (user_id, mobile, order_number, total_amount, payment_method, payment_status, order_status, shipping_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [user_id || null, mobile, orderNumber, total_amount, payment_method, paymentStatus, orderStatus, shipping_address || '']
    );

    const order_id = orderResult.insertId;

    // Insert order items
    const itemPromises = items.map(item =>
      pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [order_id, item.product_id, item.quantity, item.price]
      )
    );
    await Promise.all(itemPromises);

    // Optional: clear guest cart if needed
    // await pool.query('DELETE FROM cart WHERE user_id = ?', [user_id]);

    return NextResponse.json({
      message: 'Order placed successfully',
      order_id,
      order_number: orderNumber,
      payment_status: paymentStatus,
      order_status: orderStatus
    });
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}

/**
 * Optional: PUT /api/orders
 * Update order status or payment status
 * body: { order_id, payment_status, order_status }
 */
export async function PUT(req) {
  try {
    const { order_id, payment_status, order_status } = await req.json();

    if (!order_id) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

    const updates = [];
    const params = [];

    if (payment_status) {
      updates.push('payment_status = ?');
      params.push(payment_status);
    }
    if (order_status) {
      updates.push('order_status = ?');
      params.push(order_status);
    }
    params.push(order_id);

    const query = `UPDATE orders SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await pool.query(query, params);

    return NextResponse.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('PUT /api/orders error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

/**
 * Optional: DELETE /api/orders
 * Delete an order (use carefully)
 * body: { order_id }
 */
export async function DELETE(req) {
  try {
    const { order_id } = await req.json();

    if (!order_id) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

    await pool.query('DELETE FROM order_items WHERE order_id = ?', [order_id]);
    await pool.query('DELETE FROM orders WHERE id = ?', [order_id]);

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/orders error:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
