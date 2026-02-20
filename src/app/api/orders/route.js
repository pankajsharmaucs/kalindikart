import { NextResponse } from 'next/server';
import { pool } from '../db.js';

// Helper to get the primary mobile number from either email or mobile
async function resolveUserMobile(identifier, connection) {
  const [rows] = await connection.query(
    'SELECT mobile FROM users WHERE mobile = ? OR email = ? LIMIT 1',
    [identifier, identifier]
  );
  return rows.length > 0 ? rows[0].mobile : null;
}

/* ===============================
    POST – PLACE ORDER
================================ */
export async function POST(req) {
  const connection = await pool.getConnection();
  try {
    const { userId, payment_method, shipping_address } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User identifier required' }, { status: 400 });
    }

    await connection.beginTransaction();

    // 1️⃣ Resolve Identity
    const dbMobile = await resolveUserMobile(userId, connection);
    if (!dbMobile) {
      throw new Error('User not found. Please complete your profile.');
    }

    // 2️⃣ Fetch cart items using the resolved mobile number
    const [cartItems] = await connection.query(
      `SELECT c.product_id, c.quantity, p.title AS product_name, p.price 
       FROM cart c
       INNER JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [dbMobile]
    );

    if (!cartItems.length) {
      await connection.rollback();
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const paymentStatus = payment_method === 'cod' ? 'pending' : 'initiated';
    let totalAmount = 0;

    // 3️⃣ Insert order rows
    for (const item of cartItems) {
      const price = Number(item.price);
      const quantity = Number(item.quantity);
      const total = price * quantity;
      totalAmount += total;

      await connection.query(
        `INSERT INTO orders (user_id, mobile, order_number, product_id, product_name, quantity, price, total, total_amount, payment_method, payment_status, order_status, shipping_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [dbMobile, dbMobile, orderNumber, item.product_id, item.product_name, quantity, price, total, 0, payment_method || 'online', paymentStatus, 'pending', shipping_address || '']
      );
    }

    // 4️⃣ Update total_amount
    await connection.query(`UPDATE orders SET total_amount = ? WHERE order_number = ?`, [totalAmount, orderNumber]);

    // 5️⃣ Clear cart ONLY for COD (Online cleared after payment success)
    if (payment_method === 'cod') {
      await connection.query(`DELETE FROM cart WHERE user_id = ?`, [dbMobile]);
    }

    await connection.commit();
    return NextResponse.json({ success: true, order_number: orderNumber, total_amount: totalAmount });

  } catch (err) {
    await connection.rollback();
    console.error('Order error:', err);
    return NextResponse.json({ error: err.message || 'Failed to place order' }, { status: 500 });
  } finally {
    connection.release();
  }
}

/* ===============================
    GET – FETCH ORDERS
================================ */
export async function GET(req) {
  const connection = await pool.getConnection();
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId'); // email or mobile

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const dbMobile = await resolveUserMobile(userId, connection);
    if (!dbMobile) return NextResponse.json([], { status: 200 });

    const [orders] = await connection.query(
      `SELECT o.*, p.images
       FROM orders o
       LEFT JOIN products p ON o.product_id = p.id
       WHERE o.mobile = ?
       ORDER BY o.created_at DESC`,
      [dbMobile]
    );

    const ordersMap = {};
    orders.forEach((row) => {
      if (!ordersMap[row.order_number]) {
        ordersMap[row.order_number] = { ...row, items: [] };
      }

      let firstImage = null;
      if (row.images) {
        try {
          const imgs = typeof row.images === 'string' ? JSON.parse(row.images) : row.images;
          firstImage = imgs.length ? imgs[0] : null;
        } catch (e) {}
      }

      ordersMap[row.order_number].items.push({
        product_name: row.product_name,
        price: parseFloat(row.price),
        quantity: parseInt(row.quantity),
        image: firstImage,
      });
    });

    return NextResponse.json(Object.values(ordersMap));
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  } finally {
    connection.release();
  }
}

/* ===============================
    PUT – CANCEL ORDER
================================ */
export async function PUT(req) {
  try {
    const { order_number } = await req.json();
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        `UPDATE orders
         SET order_status = 'cancelled', payment_status = 'failed', updated_at = NOW()
         WHERE order_number = ? AND order_status NOT IN ('cancelled','delivered')`,
        [order_number]
      );
      if (result.affectedRows === 0) return NextResponse.json({ error: 'Order not cancellable' }, { status: 404 });
      return NextResponse.json({ success: true, message: 'Cancelled' });
    } finally {
      connection.release();
    }
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}