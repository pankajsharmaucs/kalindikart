import { NextResponse } from 'next/server';
import { pool } from '../db.js';

/* ===============================
   GET - Fetch Website Settings
================================ */
export async function GET() {
  let connection;
  try {
    connection = await pool.getConnection();

    const [rows] = await connection.query(
      `SELECT * FROM website_settings LIMIT 1`
    );

    return NextResponse.json({
      success: true,
      data: rows[0] || null,
    });

  } catch (error) {
    console.error('GET ERROR:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

/* ===============================
   PUT - Update Website Settings
================================ */
export async function PUT(req) {
  let connection;
  try {
    const body = await req.json();

    const {
      site_name,
      logo,
      favicon,
      payment_gateway,
      payment_api_key,
      whatsapp_url,
      contact_email,
      contact_phone,
      delivery_info,
      facebook_url,
      instagram_url,
      twitter_url,
      youtube_url,
    } = body;

    connection = await pool.getConnection();

    const [result] = await connection.query(
      `UPDATE website_settings SET
        site_name = ?,
        logo = ?,
        favicon = ?,
        payment_gateway = ?,
        payment_api_key = ?,
        whatsapp_url = ?,
        contact_email = ?,
        contact_phone = ?,
        delivery_info = ?,
        facebook_url = ?,
        instagram_url = ?,
        twitter_url = ?,
        youtube_url = ?,
        updated_at = NOW()
      WHERE id = 1`,
      [
        site_name,
        logo,
        favicon,
        payment_gateway,
        payment_api_key,
        whatsapp_url,
        contact_email,
        contact_phone,
        delivery_info,
        facebook_url,
        instagram_url,
        twitter_url,
        youtube_url,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      result,
    });

  } catch (error) {
    console.error('PUT ERROR:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}