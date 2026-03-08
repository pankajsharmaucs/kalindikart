import { NextResponse } from 'next/server';
import { pool } from '../../db.js';

export async function PUT(req) {
  const connection = await pool.getConnection();
  try {
    const { order_number, shipping_tracking_id, shipping_provider } = await req.json();

    if (!order_number || !shipping_tracking_id || !shipping_provider) {
      return NextResponse.json({ error: 'All data required' }, { status: 400 });
    }

    const [result] = await connection.query(
      `UPDATE orders 
       SET order_status = 'shipped', shipped_date = NOW(), 
           shipping_tracking_id = ?, shipping_provider = ?
       WHERE order_number = ? AND order_status = 'booked'`,
      [shipping_tracking_id, shipping_provider, order_number]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Order not found or not eligible' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Order marked as shipped' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  } finally {
    connection.release();
  }
}