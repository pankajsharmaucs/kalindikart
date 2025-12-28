// /app/api/admin/verifyAdmin.js
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'yoursecretkey';

/**
 * Verify Authorization: Bearer <token>
 * Returns admin row object if valid and role matches
 * Throws NextResponse with 401/403 on failure
 */
export async function verifyAdmin(req, requireSuper = true) {
  try {
    const auth = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      throw NextResponse.json({ error: 'Authorization token missing' }, { status: 401 });
    }

    const token = auth.split(' ')[1];
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      throw NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // fetch admin from DB to ensure still active
    const [rows] = await pool.query('SELECT id, name, email, role, status FROM admin_users WHERE id = ? LIMIT 1', [payload.id]);
    if (!rows || rows.length === 0) {
      throw NextResponse.json({ error: 'Admin not found' }, { status: 401 });
    }

    const admin = rows[0];
    if (admin.status !== 'active') {
      throw NextResponse.json({ error: 'Admin inactive' }, { status: 403 });
    }

    if (requireSuper && admin.role !== 'super_admin') {
      // sub-admins cannot manage site settings by default
      throw NextResponse.json({ error: 'Permission denied: super admin only' }, { status: 403 });
    }

    return admin;
  } catch (res) {
    // If error is NextResponse thrown, rethrow it
    if (res && res instanceof Response) throw res;
    // Otherwise, pass generic server error
    throw NextResponse.json({ error: 'Auth error' }, { status: 500 });
  }
}
