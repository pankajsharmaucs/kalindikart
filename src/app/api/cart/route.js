import { NextResponse } from 'next/server';
import { pool } from '../db.js';


// 1. Ensure this helper is at the top of your file
async function getDbUserId(identifier) {
  const [rows] = await pool.query(
    'SELECT id FROM users WHERE mobile = ? OR LOWER(email) = LOWER(?) LIMIT 1',
    [identifier, identifier]
  );
  return rows.length > 0 ? rows[0].id : null;
}


// GET: fetch cart
export async function GET(req) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId)
      return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 });

    const dbUserId = await getDbUserId(userId);
    if (!dbUserId) return NextResponse.json({ success: true, cartItems: [] });

    // Optimized: Use JOIN to get cart items and product details in ONE query
    const [rows] = await pool.query(
      `SELECT c.product_id, c.quantity, c.price, p.title, p.images 
       FROM cart c
       INNER JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [dbUserId]
    );

    const cartItems = rows.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: parseFloat(item.price),
      title: item.title,
      images: typeof item.images === 'string' ? JSON.parse(item.images) : item.images,
    }));

    return NextResponse.json({ success: true, cartItems });
  } catch (err) {
    console.error('GET cart error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}



export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, product } = body;

    // Validation
    if (!userId || !product?.product_id) {
      return NextResponse.json({ success: false, message: 'User & product required' }, { status: 400 });
    }

    // 2. Resolve the integer ID from the email/mobile
    const dbUserId = await getDbUserId(userId);

    if (!dbUserId) {
      return NextResponse.json({ success: false, message: 'User account not found' }, { status: 404 });
    }

    // 3. Check for existing item in cart
    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [dbUserId, product.product_id]
    );

    if (existing.length > 0) {
      // Update existing
      await pool.query('UPDATE cart SET quantity = ? WHERE id = ?', [
        existing[0].quantity + (Number(product.quantity) || 1),
        existing[0].id,
      ]);
    } else {
      // Insert new
      await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity, price, created_at) VALUES (?, ?, ?, ?, NOW())',
        [
          dbUserId,
          product.product_id,
          Number(product.quantity) || 1,
          parseFloat(product.price)
        ]
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    // Check your terminal console for this log!
    console.error('CRITICAL POST CART ERROR:', err);
    return NextResponse.json({
      success: false,
      message: 'Server error',
      debug: err.message // Optional: temporarily show error to fix it
    }, { status: 500 });
  }
}

/* --- PUT: UPDATE QUANTITY --- */
export async function PUT(req) {
  try {
    const { userId, productId, quantity } = await req.json();

    if (!userId || !productId || quantity === undefined) {
      return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });
    }

    const dbUserId = await getDbUserId(userId);
    if (!dbUserId) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Logic: If quantity set to 0, treat as delete
    if (Number(quantity) <= 0) {
      await pool.query('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [dbUserId, productId]);
    } else {
      await pool.query(
        'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
        [Number(quantity), dbUserId, productId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PUT cart error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

/* --- DELETE: REMOVE ITEM --- */
export async function DELETE(req) {
  try {
    const { userId, productId } = await req.json();

    if (!userId || !productId) {
      return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });
    }

    const dbUserId = await getDbUserId(userId);
    if (!dbUserId) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    await pool.query('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [dbUserId, productId]);

    return NextResponse.json({ success: true, message: 'Item removed' });
  } catch (err) {
    console.error('DELETE cart error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
