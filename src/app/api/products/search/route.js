import { NextResponse } from 'next/server';
import { pool } from '../../db'; // Adjusted path based on your structure

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q'); // 'q' for query string

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const searchTerm = `%${query}%`;

    // Fetch products matching title, description, or category
    const [rows] = await pool.query(
      `
      SELECT 
        p.id, p.title, p.slug, p.price, p.images, 
        c.category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN master_category c ON p.category_id = c.id
      WHERE (p.title LIKE ? OR p.description LIKE ? OR c.category_name LIKE ?)
      AND p.status = 'active'
      ORDER BY p.id DESC
      LIMIT 10
      `,
      [searchTerm, searchTerm, searchTerm]
    );

    // Parse images if they are stored as JSON strings
    const products = rows.map(p => ({
      ...p,
      images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images
    }));

    return NextResponse.json(products);

  } catch (error) {
    console.error('SEARCH API ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    );
  }
}