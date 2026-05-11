const db = require('../db');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/repair-requests
const listRepairs = asyncHandler(async (req, res) => {
  const { status_id, urgency_id, category_id, worker_id, property_id } = req.query;
  const params = [];
  const where = [];

  let query = `
    SELECT rr.id, rr.description, rr.estimated_completion, rr.created_at,
           s.name AS status, u.name AS urgency, c.name AS category,
           p.name AS property_name, p.id AS property_id,
           w.first_name AS worker_first, w.last_name AS worker_last,
           rr.worker_id,
           COALESCE(json_agg(ri.image_url) FILTER (WHERE ri.id IS NOT NULL), '[]') AS images
    FROM repair_requests rr
    LEFT JOIN statuses s ON s.id = rr.status_id
    LEFT JOIN urgencies u ON u.id = rr.urgency_id
    LEFT JOIN categories c ON c.id = rr.category_id
    LEFT JOIN properties p ON p.id = rr.property_id
    LEFT JOIN users w ON w.id = rr.worker_id
    LEFT JOIN repair_images ri ON ri.repair_id = rr.id
  `;

  if (status_id)   { params.push(status_id);   where.push(`rr.status_id = $${params.length}`); }
  if (urgency_id)  { params.push(urgency_id);  where.push(`rr.urgency_id = $${params.length}`); }
  if (category_id) { params.push(category_id); where.push(`rr.category_id = $${params.length}`); }
  if (worker_id)   { params.push(worker_id);   where.push(`rr.worker_id = $${params.length}`); }
  if (property_id) { params.push(property_id); where.push(`rr.property_id = $${params.length}`); }

  if (where.length) query += ' WHERE ' + where.join(' AND ');
  query += ' GROUP BY rr.id, s.name, u.name, c.name, p.name, p.id, w.first_name, w.last_name ORDER BY rr.created_at DESC';

  const { rows } = await db.query(query, params);
  res.json(rows);
});

// GET /api/repair-requests/:id
const getRepair = asyncHandler(async (req, res) => {
  const [repairRes, imgsRes] = await Promise.all([
    db.query(
      `SELECT rr.*, s.name AS status, u.name AS urgency, c.name AS category,
              p.name AS property_name, 
              w.first_name AS worker_first, w.last_name AS worker_last
       FROM repair_requests rr
       LEFT JOIN statuses s ON s.id = rr.status_id
       LEFT JOIN urgencies u ON u.id = rr.urgency_id
       LEFT JOIN categories c ON c.id = rr.category_id
       LEFT JOIN properties p ON p.id = rr.property_id
       LEFT JOIN users w ON w.id = rr.worker_id
       WHERE rr.id = $1`,
      [req.params.id]
    ),
    db.query(
      'SELECT * FROM repair_images WHERE repair_id = $1',
      [req.params.id]
    ),
  ]);

  if (!repairRes.rows.length) {
    return res.status(404).json({ error: 'Repair request not found' });
  }

  res.json({ ...repairRes.rows[0], images: imgsRes.rows });
});

// POST /api/repair-requests
const createRepair = asyncHandler(async (req, res) => {
  const { property_id, description, category_id, urgency_id, estimated_completion } = req.body;

  const prop = await db.query(
    'SELECT owner_id FROM properties WHERE id = $1',
    [property_id]
  );
  if (!prop.rows.length) {
    return res.status(404).json({ error: 'Property not found' });
  }
  if (prop.rows[0].owner_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden - not your property' });
  }

  const defaultStatus = await db.query(
    "SELECT id FROM statuses WHERE name = 'open' LIMIT 1"
  );
  const status_id = defaultStatus.rows[0]?.id || null;

  const { rows } = await db.query(
    `INSERT INTO repair_requests 
      (property_id, description, category_id, status_id, urgency_id, estimated_completion)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [property_id, description, category_id || null, status_id, urgency_id || null, estimated_completion || null]
  );
  res.status(201).json(rows[0]);
});

// PATCH /api/repair-requests/:id
const updateRepair = asyncHandler(async (req, res) => {
  const { description, category_id, status_id, urgency_id, estimated_completion } = req.body;

  const { rows } = await db.query(
    `UPDATE repair_requests SET
       description          = COALESCE($1, description),
       category_id          = COALESCE($2, category_id),
       status_id            = COALESCE($3, status_id),
       urgency_id           = COALESCE($4, urgency_id),
       estimated_completion = COALESCE($5, estimated_completion)
     WHERE id = $6 RETURNING *`,
    [description, category_id, status_id, urgency_id, estimated_completion, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Repair request not found' });
  res.json(rows[0]);
});

// DELETE /api/repair-requests/:id
const deleteRepair = asyncHandler(async (req, res) => {
  const repair = await db.query(
    `SELECT rr.id FROM repair_requests rr
     JOIN properties p ON p.id = rr.property_id
     WHERE rr.id = $1 AND p.owner_id = $2`,
    [req.params.id, req.user.id]
  );
  if (!repair.rows.length) {
    return res.status(403).json({ error: 'Forbidden or not found' });
  }

  await db.query('DELETE FROM repair_requests WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

// POST /api/repair-requests/:id/images
const addRepairImage = asyncHandler(async (req, res) => {
  const { image_url } = req.body;
  const { rows } = await db.query(
    'INSERT INTO repair_images (repair_id, image_url) VALUES ($1,$2) RETURNING *',
    [req.params.id, image_url]
  );
  res.status(201).json(rows[0]);
});

// DELETE /api/repair-requests/:id/images/:imgId
const deleteRepairImage = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    'DELETE FROM repair_images WHERE id = $1 AND repair_id = $2 RETURNING id',
    [req.params.imgId, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Image not found' });
  res.status(204).end();
});

// POST /api/repair-requests/:id/assign/:workerId
const assignWorker = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `UPDATE repair_requests SET worker_id = $1 WHERE id = $2 RETURNING *`,
    [req.params.workerId, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Repair request not found' });
  res.json(rows[0]);
});

module.exports = {
  listRepairs,
  getRepair,
  createRepair,
  updateRepair,
  deleteRepair,
  addRepairImage,
  deleteRepairImage,
  assignWorker,
};