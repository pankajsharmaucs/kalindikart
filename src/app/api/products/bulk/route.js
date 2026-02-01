import { NextResponse } from 'next/server'
import { pool } from '../../db'
import { read, utils } from 'xlsx'
import AdmZip from 'adm-zip'
import fs from 'fs-extra'
import path from 'path'

export async function POST(req) {
  try {
    const formData = await req.formData()
    const excelFile = formData.get('file')
    const zipFile = formData.get('images')

    if (!excelFile || !zipFile) {
      return NextResponse.json(
        { error: 'Excel file and Images ZIP are required' },
        { status: 400 }
      )
    }

    /* ---------- TEMP DIR ---------- */
    const tempDir = path.join(process.cwd(), 'tmp/product-images')
    await fs.ensureDir(tempDir)

    /* ---------- EXTRACT ZIP ---------- */
    const zip = new AdmZip(Buffer.from(await zipFile.arrayBuffer()))
    zip.extractAllTo(tempDir, true)

    /* ---------- READ EXCEL ---------- */
    const workbook = read(Buffer.from(await excelFile.arrayBuffer()), { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const products = utils.sheet_to_json(sheet)

    if (!products.length) {
      return NextResponse.json({ error: 'No products found' }, { status: 400 })
    }

    const conn = await pool.getConnection()
    await conn.beginTransaction()

    try {
      for (const p of products) {
        const productId = Number(p.product_id)

        /* ---------- INSERT PRODUCT ---------- */
        await conn.query(
          `INSERT INTO products
          (id, category_id, sub_category_id, title, slug, sku, price, discount, tax, shipping_cost, quantity, description, images, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
          ON DUPLICATE KEY UPDATE id=id`,
          [
            productId,
            p.category_id,
            p.sub_category_id,
            p.title,
            p.slug,
            p.sku,
            p.price,
            p.discount || 0,
            p.tax || 0,
            p.shipping_cost || 0,
            p.quantity || 0,
            p.description || null,
            JSON.stringify([])
          ]
        )

        /* ---------- IMAGE HANDLING ---------- */
        const productDir = path.join(process.cwd(), 'public/assets/products', String(productId))
        await fs.ensureDir(productDir)

        const imageUrls = []
        let index = 1

        // Check if ZIP has a folder for this product_id
        const productZipDir = path.join(tempDir, String(productId))
        if (await fs.pathExists(productZipDir)) {
          const imageFiles = (await fs.readdir(productZipDir))
            .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
            .sort()

          for (const imgFile of imageFiles) {
            const ext = path.extname(imgFile)
            const newName = `img${index}${ext}`
            const sourcePath = path.join(productZipDir, imgFile)
            const targetPath = path.join(productDir, newName)

            await fs.copy(sourcePath, targetPath)
            imageUrls.push(newName)
            index++
          }
        }

        /* ---------- UPDATE IMAGES ---------- */
        await conn.query(
          `UPDATE products SET images=? WHERE id=?`,
          [JSON.stringify(imageUrls), productId]
        )
      }

      await conn.commit()
      conn.release()
      await fs.remove(tempDir)

      return NextResponse.json({
        success: true,
        message: 'Products & images uploaded successfully'
      })
    } catch (err) {
      await conn.rollback()
      conn.release()
      throw err
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
