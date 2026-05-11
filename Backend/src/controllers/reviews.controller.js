const db = require('../db');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/reviews
const listReviews = asyncHandler(async (req, res) => {
  const { worker_id, property_owner_id } = req.query;
  const params = [];
  const where = [];

  let query = `
    SELECT r.*, 
           u.first_name AS worker_first, u.last_name AS worker_last,
           o.first_name AS owner_first, o.last_name AS owner_last,
           rr.description AS repair_description
    FROM reviews r
    JOIN users u ON u.id = r.worker_id
    JOIN users o ON o.id = r.property_owner_id
    LEFT JOIN repair_requests rr ON rr.id = r.repair_id
  `;

  if (worker_id)         { params.push(worker_id);         where.push(`r.worker_id = $${params.length}`); }
  if (property_owner_id) { params.push(property_owner_id); where.push(`r.property_owner_id = $${params.length}`); }
  if (where.length) query += ' WHERE ' + where.join(' AND ');
  query += ' ORDER BY r.created_at DESC';

  const { rows } = await db.query(query, params);
  res.json(rows);
});

// GET /api/reviews/:id
const getReview = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT r.*,
            u.first_name AS worker_first, u.last_name AS worker_last,
            o.first_name AS owner_first, o.last_name AS owner_last,
            rr.description AS repair_description
     FROM reviews r
     JOIN users u ON u.id = r.worker_id
     JOIN users o ON o.id = r.property_owner_id
     LEFT JOIN repair_requests rr ON rr.id = r.repair_id
     WHERE r.id = $1`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Review not found' });
  res.json(rows[0]);
});

// POST /api/reviews
const createReview = asyncHandler(async (req, res) => {
  const { worker_id, repair_id, description, rating } = req.body;

  // Provjeri da li repair pripada ownerovom propertiju
  if (repair_id) {
    const { rows } = await db.query(
      `SELECT rr.id FROM repair_requests rr
       JOIN properties p ON p.id = rr.property_id
       WHERE rr.id = $1 AND p.owner_id = $2`,
      [repair_id, req.user.id]
    );
    if (!rows.length) {
      return res.status(403).json({ error: 'This repair does not belong to your property' });
    }
  }

  // Provjeri da li vec postoji review za ovaj repair
  if (repair_id) {
    const existing = await db.query(
      'SELECT id FROM reviews WHERE repair_id = $1 AND property_owner_id = $2',
      [repair_id, req.user.id]
    );
    if (existing.rows.length) {
      return res.status(409).json({ error: 'You already reviewed this repair' });
    }
  }

  const { rows } = await db.query(
    `INSERT INTO reviews (worker_id, property_owner_id, repair_id, description, rating)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [worker_id, req.user.id, repair_id || null, description, rating]
  );
  res.status(201).json(rows[0]);
});

// PATCH /api/reviews/:id
const updateReview = asyncHandler(async (req, res) => {
  const review = await db.query(
    'SELECT property_owner_id FROM reviews WHERE id = $1',
    [req.params.id]
  );
  if (!review.rows.length) return res.status(404).json({ error: 'Review not found' });
  if (review.rows[0].property_owner_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { description, rating } = req.body;
  const { rows } = await db.query(
    `UPDATE reviews SET
       description = COALESCE($1, description),
       rating      = COALESCE($2, rating)
     WHERE id = $3 RETURNING *`,
    [description, rating, req.params.id]
  );
  res.json(rows[0]);
});

// DELETE /api/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await db.query(
    'SELECT property_owner_id FROM reviews WHERE id = $1',
    [req.params.id]
  );
  if (!review.rows.length) return res.status(404).json({ error: 'Review not found' });
  if (review.rows[0].property_owner_id !== req.user.id && req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await db.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

module.exports = { listReviews, getReview, createReview, updateReview, deleteReview };