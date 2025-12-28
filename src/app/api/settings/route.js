// /app/api/settings/route.js
import { NextResponse } from 'next/server';
import { pool } from '../db.js';
import { verifyAdmin } from '../admin/verifyAdmin.js';

/**
 * GET /api/settings
 * Public — returns the current website settings (single row)
 */
export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM website_settings ORDER BY id DESC LIMIT 1');
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: 'No settings found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

/**
 * PUT /api/settings
 * Admin-only (super_admin) — create or update website settings.
 * Accepts JSON body with allowed keys (below).
 */
export async function PUT(req) {
  // Authenticate admin (super admin only)
  await verifyAdmin(req, true);

  try {
    const body = await req.json();

    // Allowed fields to update/create
    const allowed = [
      'site_name',
      'logo',
      'favicon',
      'payment_gateway',
      'payment_api_key',
      'whatsapp_url',
      'contact_email',
      'contact_phone',
      'delivery_info',
      'address',
      'facebook_url',
      'instagram_url',
      'twitter_url',
      'youtube_url',
      'primary_color',
      'secondary_color',
      'seo_title',
      'seo_description',
      'og_image'
    ];

    // Build dynamic set clause from provided allowed fields
    const updates = [];
    const values = [];

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        updates.push(`\`${key}\` = ?`);
        values.push(body[key]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 });
    }

    // Check if a settings row already exists
    const [existing] = await pool.query('SELECT id FROM website_settings LIMIT 1');

    if (existing && existing.length > 0) {
      // Update the latest settings row (we use id of first found)
      const id = existing[0].id;
      const sql = `UPDATE website_settings SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;
      values.push(id);
      await pool.query(sql, values);
      return NextResponse.json({ message: 'Settings updated', id });
    } else {
      // Insert new settings row
      const cols = updates.map(u => u.split(' = ')[0].replace(/`/g, ''));
      const placeholders = cols.map(() => '?').join(', ');
      const insertSql = `INSERT INTO website_settings (${cols.join(', ')}) VALUES (${placeholders})`;
      await pool.query(insertSql, values);
      return NextResponse.json({ message: 'Settings created' });
    }
  } catch (error) {
    console.error('PUT /api/settings error:', error);
    // If verifyAdmin threw a NextResponse, it would be caught earlier; this is server error
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
