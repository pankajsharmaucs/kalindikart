// src/app/api/orders/route.js
import { NextResponse } from 'next/server';
import { pool } from '../db.js';

// Generate unique order number


// POST - Place order
export async function POST(req) {
  try {
    const { mobile, payment_method, shipping_address } = await req.json();
    if (!mobile) return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1️⃣ Fetch cart items with product info
      const [cartItems] = await connection.query(
        `SELECT c.*, p.title AS product_name, p.price AS product_price, p.images
         FROM cart c
         LEFT JOIN products p ON c.product_id = p.id
         WHERE c.user_id = ?`,
        [mobile]
      );

      if (!cartItems.length) {
        return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
      }

      let orderNumber = '';
      const paymentStatus = payment_method === 'cod' ? 'pending' : 'paid';
      const orderStatus = 'pending';
      let total_amount = 0;

      // 2️⃣ Insert each item as separate order row
      for (const item of cartItems) {
        const price = parseFloat(item.product_price || item.price || 0);
        const quantity = parseInt(item.quantity || 1);
        const total = price * quantity;
        total_amount += total;

        orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

        await connection.query(
          `INSERT INTO orders
            (user_id, mobile, order_number, product_id, product_name, quantity, price, total, total_amount, payment_method, payment_status, order_status, shipping_address, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            mobile, // user_id is mobile
            mobile,
            orderNumber,
            item.product_id,
            item.product_name || 'Product',
            quantity,
            price,
            total,
            0, // will update total_amount later
            payment_method || 'online',
            paymentStatus,
            orderStatus,
            shipping_address || ''
          ]
        );
      }

      // 3️⃣ Update total_amount for all items in this order
      await connection.query(
        `UPDATE orders SET total_amount = ? WHERE order_number = ?`,
        [total_amount, orderNumber]
      );

      // 4️⃣ Clear cart
      await connection.query('DELETE FROM cart WHERE user_id = ?', [mobile]);

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Order placed successfully',
        order_number: orderNumber,
        total_amount,
        payment_status: paymentStatus,
        order_status: orderStatus,
      });
    } catch (err) {
      await connection.rollback();
      console.error('Order transaction error:', err);
      return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}

// GET - Fetch all orders by mobile, grouped by order_number with product images
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get('mobile');
    if (!mobile) return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });

    const connection = await pool.getConnection();
    try {
      const [orders] = await connection.query(
        `SELECT o.*, p.images
         FROM orders o
         LEFT JOIN products p ON o.product_id = p.id
         WHERE o.mobile = ?
         ORDER BY o.created_at DESC`,
        [mobile]
      );

      if (!orders.length) return NextResponse.json([], { status: 200 });

      // Group items by order_number
      const ordersMap = {};
      orders.forEach((row) => {
        if (!ordersMap[row.order_number]) {
          ordersMap[row.order_number] = {
            ...row,
            items: [],
          };
        }

        let firstImage = null;
        if (row.images) {
          try {
            const imgs = typeof row.images === 'string' ? JSON.parse(row.images) : row.images;
            firstImage = imgs.length ? imgs[0] : null;
          } catch (err) {
            console.error('Invalid images JSON:', row.images);
          }
        }

        ordersMap[row.order_number].items.push({
          product_id: row.product_id,
          product_name: row.product_name,
          price: parseFloat(row.price),
          quantity: parseInt(row.quantity),
          total: parseFloat(row.total),
          image: firstImage,
          images: row.images,
        });
      });

      return NextResponse.json(Object.values(ordersMap));
    } catch (err) {
      console.error('GET /api/orders error:', err);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// PUT - Cancel order
export async function PUT(req) {
  try {
    const { order_number } = await req.json();
    if (!order_number) return NextResponse.json({ error: 'Order number is required' }, { status: 400 });

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        `UPDATE orders
         SET order_status = 'cancelled', payment_status = 'failed', updated_at = NOW()
         WHERE order_number = ? AND order_status NOT IN ('cancelled','delivered')`,
        [order_number]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json({ error: 'No cancellable order found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: 'Order cancelled successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('PUT /api/orders error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
