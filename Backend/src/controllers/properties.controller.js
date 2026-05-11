const db = require('../db');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/properties
const listProperties = asyncHandler(async (req, res) => {
  const { city_id, owner_id } = req.query;
  const params = [];
  const where = [];

  let query = `
    SELECT p.*, c.name AS city, 
           u.first_name AS owner_first, u.last_name AS owner_last,
           COALESCE(json_agg(pi.image_url) FILTER (WHERE pi.id IS NOT NULL), '[]') AS images
    FROM properties p
    LEFT JOIN cities c ON c.id = p.city_id
    LEFT JOIN users u ON u.id = p.owner_id
    LEFT JOIN property_images pi ON pi.property_id = p.id
  `;

  if (city_id)  { params.push(city_id);  where.push(`p.city_id = $${params.length}`); }
  if (owner_id) { params.push(owner_id); where.push(`p.owner_id = $${params.length}`); }
  if (where.length) query += ' WHERE ' + where.join(' AND ');
  query += ' GROUP BY p.id, c.name, u.first_name, u.last_name ORDER BY p.created_at DESC';

  const { rows } = await db.query(query, params);
  res.json(rows);
});

// GET /api/properties/:id
const getProperty = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT p.*, c.name AS city,
            u.first_name AS owner_first, u.last_name AS owner_last,
            COALESCE(
              json_agg(DISTINCT jsonb_build_object('id', pi.id, 'url', pi.image_url))
              FILTER (WHERE pi.id IS NOT NULL), '[]'
            ) AS images
     FROM properties p
     LEFT JOIN cities c ON c.id = p.city_id
     LEFT JOIN users u ON u.id = p.owner_id
     LEFT JOIN property_images pi ON pi.property_id = p.id
     WHERE p.id = $1
     GROUP BY p.id, c.name, u.first_name, u.last_name`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Property not found' });
  res.json(rows[0]);
});

// POST /api/properties
const createProperty = asyncHandler(async (req, res) => {
  const { name, address, city_id, description } = req.body;
  const { rows } = await db.query(
    `INSERT INTO properties (name, address, city_id, description, owner_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [name, address, city_id || null, description, req.user.id]
  );
  res.status(201).json(rows[0]);
});

// PATCH /api/properties/:id
const updateProperty = asyncHandler(async (req, res) => {
  const prop = await db.query(
    'SELECT owner_id FROM properties WHERE id = $1',
    [req.params.id]
  );
  if (!prop.rows.length) return res.status(404).json({ error: 'Property not found' });
  if (prop.rows[0].owner_id !== req.user.id && req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { name, address, city_id, description } = req.body;
  const { rows } = await db.query(
    `UPDATE properties SET
       name        = COALESCE($1, name),
       address     = COALESCE($2, address),
       city_id     = COALESCE($3, city_id),
       description = COALESCE($4, description)
     WHERE id = $5 RETURNING *`,
    [name, address, city_id, description, req.params.id]
  );
  res.json(rows[0]);
});

// DELETE /api/properties/:id
const deleteProperty = asyncHandler(async (req, res) => {
  const prop = await db.query(
    'SELECT owner_id FROM properties WHERE id = $1',
    [req.params.id]
  );
  if (!prop.rows.length) return res.status(404).json({ error: 'Property not found' });
  if (prop.rows[0].owner_id !== req.user.id && req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await db.query('DELETE FROM properties WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

// GET /api/properties/:id/images
const getPropertyImages = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    'SELECT * FROM property_images WHERE property_id = $1',
    [req.params.id]
  );
  res.json(rows);
});

// POST /api/properties/:id/images
const addPropertyImage = asyncHandler(async (req, res) => {
  const { image_url } = req.body;
  const { rows } = await db.query(
    'INSERT INTO property_images (property_id, image_url) VALUES ($1,$2) RETURNING *',
    [req.params.id, image_url]
  );
  res.status(201).json(rows[0]);
});

// DELETE /api/properties/:id/images/:imgId
const deletePropertyImage = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    'DELETE FROM property_images WHERE id = $1 AND property_id = $2 RETURNING id',
    [req.params.imgId, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Image not found' });
  res.status(204).end();
});

// GET /api/properties/:id/repair-requests
const getPropertyRepairs = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT rr.*, s.name AS status, u.name AS urgency, c.name AS category,
            w.first_name AS worker_first, w.last_name AS worker_last
     FROM repair_requests rr
     LEFT JOIN statuses s ON s.id = rr.status_id
     LEFT JOIN urgencies u ON u.id = rr.urgency_id
     LEFT JOIN categories c ON c.id = rr.category_id
     LEFT JOIN users w ON w.id = rr.worker_id
     WHERE rr.property_id = $1
     ORDER BY rr.created_at DESC`,
    [req.params.id]
  );
  res.json(rows);
});

module.exports = {
  listProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyImages,
  addPropertyImage,
  deletePropertyImage,
  getPropertyRepairs,
};