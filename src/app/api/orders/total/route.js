import { NextResponse } from 'next/server';
import { pool } from '../../db.js';

/* ===============================
    GET – ALL ORDERS WITH USER & PRODUCT INFO
================================ */
export async function GET() {
  const connection = await pool.getConnection();
  try {
    // Join orders with users and products
    const [rows] = await connection.query(
      `
      SELECT 
        o.*, 
        u.*, 
        p.*
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN products p ON o.product_id = p.id
      ORDER BY o.created_at DESC
      `
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error('GET ALL ORDERS WITH USER & PRODUCT INFO ERROR:', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  } finally {
    connection.release();
  }
}