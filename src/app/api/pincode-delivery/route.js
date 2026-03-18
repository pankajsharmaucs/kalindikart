import { NextResponse } from 'next/server';
import { pool } from '../db';

const BASE_STATE = 'Delhi'; // change if needed

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get('pincode');

    if (!pincode) {
      return NextResponse.json(
        { error: 'Pincode is required' },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      `
      SELECT 
        mp.value AS pincode,
        mc.name AS city_name,
        ms.id AS state_id,
        ms.name AS state_name,
        ms.code AS state_code
      FROM master_pincodes mp
      JOIN master_cities mc ON mp.city_id = mc.id
      JOIN master_states ms ON mc.state_id = ms.id
      WHERE mp.value = ? AND mp.deleted = 0 AND mp.active = 1
      LIMIT 1
      `,
      [pincode]
    );

    if (!rows.length) {
      return NextResponse.json(
        { error: 'Invalid pincode' },
        { status: 404 }
      );
    }

    const data = rows[0];

    let delivery_code = 3; // default far

    // ✅ Same state (Delhi)
    if (data.state_name.toLowerCase() === BASE_STATE.toLowerCase()) {
      delivery_code = 1;
    } else {
      // ✅ Nearby states
      const nearbyStates = ['Haryana', 'Uttar Pradesh', 'Punjab', 'Rajasthan'];

      if (nearbyStates.includes(data.state_name)) {
        delivery_code = 2;
      } else {
        delivery_code = 3;
      }
    }

    // ✅ Delivery days
    let delivery_days = '';
    if (delivery_code === 1) delivery_days = '2-3 days';
    if (delivery_code === 2) delivery_days = '4-5 days';
    if (delivery_code === 3) delivery_days = '6-7 days';

    return NextResponse.json({
      pincode: data.pincode,
      city: data.city_name,
      state: data.state_name,
      state_code: data.state_code,
      delivery_code,
      delivery_days
    });

  } catch (error) {
    console.error('GET /pincode-delivery:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}