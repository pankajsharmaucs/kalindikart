import { NextResponse } from 'next/server';
import { pool } from '../db.js';

// ✅ Get tracking info
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const order_id = searchParams.get('order_id');

    const [rows] = await pool.query('SELECT * FROM tracking WHERE order_id = ?', [order_id]);
    if (rows.length === 0) return NextResponse.json({ message: 'No tracking data' });

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch tracking' }, { status: 500 });
  }
}

// ✅ Update tracking (admin)
export async function POST(req) {
  try {
    const { order_id, tracking_id, status, courier_name, estimated_delivery } = await req.json();

    const [exist] = await pool.query('SELECT * FROM tracking WHERE order_id = ?', [order_id]);
    if (exist.length > 0) {
      await pool.query(
        'UPDATE tracking SET tracking_id=?, status=?, courier_name=?, estimated_delivery=? WHERE order_id=?',
        [tracking_id, status, courier_name, estimated_delivery, order_id]
      );
    } else {
      await pool.query(
        'INSERT INTO tracking (order_id, tracking_id, status, courier_name, estimated_delivery, updated_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [order_id, tracking_id, status, courier_name, estimated_delivery]
      );
    }

    await pool.query('UPDATE orders SET status=? WHERE id=?', [status, order_id]);

    return NextResponse.json({ message: 'Tracking updated successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update tracking' }, { status: 500 });
  }
}
