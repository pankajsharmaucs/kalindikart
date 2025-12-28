// /app/api/settings/delete/route.js
import { NextResponse } from 'next/server';
import { pool } from '../../db.js';
import { verifyAdmin } from '../../admin/verifyAdmin.js';

export async function DELETE(req) {
  await verifyAdmin(req, true);
  try {
    // delete all rows or latest only
    await pool.query('DELETE FROM website_settings');
    return NextResponse.json({ message: 'Settings cleared' });
  } catch (error) {
    console.error('DELETE /api/settings error:', error);
    return NextResponse.json({ error: 'Failed to delete settings' }, { status: 500 });
  }
}
