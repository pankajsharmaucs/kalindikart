import { NextResponse } from 'next/server';
import { pool } from '../db.js';

/* ===============================
    GET – FETCH ORDERS
================================ */
export async function GET(req) {
  const connection = await pool.getConnection();
  try {
    const { searchParams } = new URL(req.url);
    // userId here is the identifier (mobile or email)
    const identifier = searchParams.get('userId');

    if (!identifier) {
      return NextResponse.json({ error: 'User identifier required' }, { status: 400 });
    }

    // 1. Resolve ID from users table
    const [userRows] = await connection.query(
      `SELECT id FROM users WHERE mobile = ? OR LOWER(email) = LOWER(?) LIMIT 1`,
      [identifier, identifier]
    );

    if (userRows.length === 0) return NextResponse.json([], { status: 200 });

    const dbUserId = userRows[0].id;

    // 2. Fetch orders using the resolved integer id
    const [orders] = await connection.query(
      `SELECT o.*, p.images
       FROM orders o
       LEFT JOIN products p ON o.product_id = p.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [dbUserId]
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
          firstImage = Array.isArray(imgs) ? imgs[0] : imgs;
        } catch (e) { console.error("Img error"); }
      }

      ordersMap[row.order_number].items.push({
        product_id: row.product_id,
        product_name: row.product_name,
        price: parseFloat(row.price),
        quantity: parseInt(row.quantity),
        image: firstImage,
      });
    });

    return NextResponse.json(Object.values(ordersMap));
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  } finally {
    connection.release();
  }
}



// ===POST=====
export async function POST(req) {
  const connection = await pool.getConnection();
  try {
    const { userId: identifier, payment_method, shipping_address } = await req.json();

    if (!identifier) {
      return NextResponse.json({ error: 'User identifier required' }, { status: 400 });
    }

    await connection.beginTransaction();

    // ─── 1. Find user ───────────────────────────────────────
    const [userRows] = await connection.query(
      `SELECT id, mobile 
       FROM users 
       WHERE mobile = ? OR LOWER(email) = LOWER(?) 
       LIMIT 1`,
      [identifier, identifier]
    );

    if (userRows.length === 0) {
      throw new Error('User account not found.');
    }

    const dbUserId = userRows[0].id;
    const userMobile = userRows[0].mobile;

    // ─── 2. Get aggregated cart (one row per product) ───────
    const [cartItems] = await connection.query(
      `SELECT 
         c.product_id,
         SUM(c.quantity)           AS quantity,
         p.title                   AS product_name,
         p.price
       FROM cart c
       INNER JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?
       GROUP BY c.product_id, p.title, p.price
       HAVING quantity > 0`,
      [dbUserId]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
    }

    // ─── 3. Calculate total once ────────────────────────────
    const totalOrderAmount = cartItems.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.quantity);
    }, 0);

    // ─── 4. Stable order number (better patterns possible) ──
    const orderNumber = `ORD-${Date.now()}-${dbUserId}`;

    const paymentStatus = payment_method === 'cod' ? 'pending' : 'initiated';
    const finalPaymentMethod = payment_method || 'online';
    const shipping = shipping_address || 'N/A';

    // ─── 5. Insert ONE row per unique product ───────────────
    for (const item of cartItems) {
      const qty = Number(item.quantity);
      const price = Number(item.price);
      const itemTotal = qty * price;

      await connection.query(
        `INSERT INTO orders (
     user_id, mobile, order_number, 
     product_id, product_name,
     quantity, price,                -- ✅ no total here
     total_amount,
     payment_method, payment_status,
     order_status, shipping_address,
     created_at
   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          dbUserId,
          userMobile,
          orderNumber,
          item.product_id,
          item.product_name,
          qty,
          price,
          totalOrderAmount,
          finalPaymentMethod,
          paymentStatus,
          'booked',
          shipping
        ]
      );
    }

    // ─── 6. Clear the cart ──────────────────────────────────
    await connection.query(`DELETE FROM cart WHERE user_id = ?`, [dbUserId]);

    await connection.commit();

    return NextResponse.json({
      success: true,
      order_number: orderNumber,
      total_amount: totalOrderAmount,
      item_count: cartItems.length,
    });
  } catch (error) {
    await connection.rollback();
    console.error('Order creation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

/* ===============================
    PUT – CANCEL ORDER
================================ */
export async function PUT(req) {
  const connection = await pool.getConnection();
  try {
    const { order_number, userId: identifier } = await req.json();

    if (!order_number || !identifier) {
      return NextResponse.json({ error: 'Data required' }, { status: 400 });
    }

    // 1. Resolve Identity
    const [userRows] = await connection.query(
      `SELECT id FROM users WHERE mobile = ? OR LOWER(email) = LOWER(?) LIMIT 1`,
      [identifier, identifier]
    );

    if (userRows.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    const dbUserId = userRows[0].id;

    // 2. Cancel Check
    const [result] = await connection.query(
      `UPDATE orders 
       SET order_status = 'cancelled', payment_status = 'failed', updated_at = NOW() 
       WHERE order_number = ? AND user_id = ? 
       AND order_status NOT IN ('cancelled', 'delivered', 'shipped')`,
      [order_number, dbUserId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Order not cancellable' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Cancelled' });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  } finally {
    connection.release();
  }
}