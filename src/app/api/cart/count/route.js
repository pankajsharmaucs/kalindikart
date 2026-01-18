// route.js
import { pool } from '../../db.js';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ success: false, count: 0 });

    const [rows] = await pool.query(
      'SELECT SUM(quantity) AS total FROM cart WHERE user_id = ?',
      [userId]
    );

    return NextResponse.json({ success: true, count: rows[0]?.total || 0 });
  } catch (err) {
    console.error('Cart count error:', err);
    return NextResponse.json({ success: false, count: 0 });
  }
}
