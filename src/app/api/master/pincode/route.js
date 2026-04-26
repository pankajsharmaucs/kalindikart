import { NextResponse } from 'next/server';
import { pool } from '../../db.js';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get('pincode');

    if (!pincode) {
      return NextResponse.json(
        { success: false, error: 'Pincode is required' },
        { status: 400 }
      );
    }

    // 🔥 JOIN QUERY
    const [rows] = await pool.query(
      `SELECT 
        mp.value AS pincode,

        mc.id AS city_id,          -- ✅ ADD
        mc.name AS city_name,

        ms.id AS state_id,         -- ✅ ADD
        ms.name AS state_name

      FROM master_pincodes mp
      JOIN master_cities mc ON mp.city_id = mc.id
      JOIN master_states ms ON mc.state_id = ms.id

      WHERE mp.value = ?
        AND mp.active = 1
        AND mp.deleted = 0
        AND mc.active = 1
        AND mc.deleted = 0
        AND ms.active = 1
        AND ms.deleted = 0

   LIMIT 1`,
      [parseInt(pincode)]   // 🔥 IMPORTANT (your DB uses INT)
    );

    if (!rows.length) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or unsupported pincode'
      });
    }

    return NextResponse.json({
      success: true,
      data: rows[0]
    });

  } catch (err) {
    console.error("Pincode API error:", err);

    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Server error'
      },
      { status: 500 }
    );
  }
}