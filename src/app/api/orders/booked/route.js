// src/app/api/orders/booked/route.js
import { NextResponse } from 'next/server';
import { pool } from '../../db.js';

export async function GET() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT COUNT(*) AS count 
       FROM orders 
       WHERE order_status = 'booked'`
    );

    return NextResponse.json({ count: rows[0].count });
  } catch (err) {
    console.error('GET TOTAL BOOKED ORDERS ERROR:', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  } finally {
    connection.release();
  }
}