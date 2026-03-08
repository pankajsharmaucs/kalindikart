import { NextResponse } from 'next/server';
import { pool } from '../db';
import fs from 'fs-extra';
import path from 'path';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const productSlug = searchParams.get('slug');      // product detail
    const categorySlug = searchParams.get('category'); // category page

    /* =========================
       SINGLE PRODUCT BY SLUG
    ========================= */
    if (productSlug) {
      const [rows] = await pool.query(
        `
        SELECT p.*, c.category_name, c.slug AS category_slug
        FROM products p
        LEFT JOIN master_category c ON p.category_id = c.id
        WHERE p.slug = ?
        LIMIT 1
        `,
        [productSlug]
      );

      if (rows.length === 0) {
        return NextResponse.json(null, { status: 404 });
      }

      const product = rows[0];

      // --- FETCH SPECIFICATIONS FOR THIS PRODUCT ---
      const [specs] = await pool.query(
        `SELECT id, icon, title, value FROM product_specification 
         WHERE product_id = ? AND status = 'active'`,
        [product.id]
      );

      // Add specifications array to the product object
      product.specifications = specs;

      return NextResponse.json(product);
    }

    /* =========================
       CATEGORY → category_id (Logic remains the same)
    ========================= */
    let categoryId = null;
    if (categorySlug) {
      const [cat] = await pool.query(
        `SELECT id FROM master_category WHERE LOWER(slug) = ? LIMIT 1`,
        [categorySlug.toLowerCase()]
      );
      if (cat.length === 0) return NextResponse.json([]);
      categoryId = cat[0].id;
    }

    /* =========================
       FETCH ALL PRODUCTS (Logic remains the same)
    ========================= */
    let query = `
      SELECT 
        p.id, p.title, p.slug, p.price, p.discount, p.tax,
        p.shipping_cost, p.quantity, p.stock, p.description,
        p.images, p.created_at, c.category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN master_category c ON p.category_id = c.id
      WHERE p.status = 'active'
    `;

    const params = [];
    if (categoryId) {
      query += ` AND p.category_id = ?`;
      params.push(categoryId);
    }

    query += ` ORDER BY p.id DESC`;
    const [allRows] = await pool.query(query, params);
    
    return NextResponse.json(allRows);

  } catch (error) {
    console.error('GET PRODUCTS ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}


export async function POST(req) {
  try {
    const formData = await req.formData();
    const title = formData.get('title');
    const slug = formData.get('slug');
    const category_id = Number(formData.get('category_id'));
    const sub_cat_id = formData.get('sub_cat_id') ? Number(formData.get('sub_cat_id')) : null;
    const price = Number(formData.get('price'));
    const discount = Number(formData.get('discount') || 0);
    const tax = Number(formData.get('tax') || 0);
    const shipping_cost = Number(formData.get('shipping_cost') || 0);
    const quantity = Number(formData.get('quantity') || 0);
    const description = formData.get('description');

    const images = formData.getAll('images'); // array of File objects

    // 1️⃣ Insert product first to get ID
    const [result] = await pool.query(
      `INSERT INTO products (title, slug, category_id, sub_category_id, price, discount, tax, shipping_cost, quantity, description, images, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [title, slug, category_id, sub_cat_id, price, discount, tax, shipping_cost, quantity, description, JSON.stringify([])]
    );

    const productId = result.insertId;
    const productDir = path.join(process.cwd(), 'public/assets/products', String(productId));
    await fs.ensureDir(productDir);

    const imageNames = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const ext = path.extname(img.name);
      const newName = `img${i + 1}${ext}`;
      const filePath = path.join(productDir, newName);
      const buffer = Buffer.from(await img.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      imageNames.push(newName);
    }

    // Update product with image names
    await pool.query(`UPDATE products SET images=? WHERE id=?`, [JSON.stringify(imageNames), productId]);

    return NextResponse.json({ message: 'Product & images uploaded successfully', id: productId });
  } catch (err) {
    console.error('UPLOAD SINGLE PRODUCT ERROR:', err);
    return NextResponse.json({ error: 'Failed to upload product', details: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      slug,
      category_id,
      sub_cat_id,
      price,
      discount,
      tax,
      shipping_cost,
      quantity,
      description,
      images
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Ensure images is JSON array
    const imagesArray = Array.isArray(images) ? images : JSON.parse(images || '[]');

    const query = `
      UPDATE products SET 
        title = ?, slug = ?, category_id = ?, sub_category_id = ?,
        price = ?, discount = ?, tax = ?, shipping_cost = ?,
        quantity = ?, description = ?, images = ?
      WHERE id = ?
    `;

    const params = [
      title,
      slug,
      category_id,
      sub_cat_id || null,
      price,
      discount || 0,
      tax || 0,
      shipping_cost || 0,
      quantity,
      description,
      JSON.stringify(imagesArray),
      id
    ];

    try {
      await pool.query(query, params);
    } catch (err) {
      console.error('MySQL UPDATE ERROR:', err);
      return NextResponse.json({ error: 'Database update failed', details: err.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('UPDATE PRODUCT ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to update product', details: error.message },
      { status: 500 }
    );
  }
}