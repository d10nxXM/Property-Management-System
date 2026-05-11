const db = require('../db');
const asyncHandler = require('../middleware/asyncHandler');

// POST /api/repair-requests/:id/applications — worker aplicira
const applyForRepair = asyncHandler(async (req, res) => {
  const { proposed_completion, message, proposed_price } = req.body;

  // Provjeri da li repair postoji
  const repair = await db.query(
    'SELECT id FROM repair_requests WHERE id = $1',
    [req.params.id]
  );
  if (!repair.rows.length) {
    return res.status(404).json({ error: 'Repair request not found' });
  }

  // Provjeri da worker nije vlasnik propertija
  const isOwner = await db.query(
    `SELECT p.owner_id FROM repair_requests rr
     JOIN properties p ON p.id = rr.property_id
     WHERE rr.id = $1 AND p.owner_id = $2`,
    [req.params.id, req.user.id]
  );
  if (isOwner.rows.length) {
    return res.status(403).json({ error: 'You cannot apply for your own property repair' });
  }

  const { rows } = await db.query(
    `INSERT INTO repair_applications 
      (repair_id, worker_id, proposed_completion, message, proposed_price)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (repair_id, worker_id) DO UPDATE SET
       proposed_completion = EXCLUDED.proposed_completion,
       message             = EXCLUDED.message,
       proposed_price      = EXCLUDED.proposed_price
     RETURNING *`,
    [req.params.id, req.user.id, proposed_completion || null, message || null, proposed_price || null]
  );
  res.status(201).json(rows[0]);
});

// GET /api/repair-requests/:id/applications — owner vidi aplikacije
const listApplications = asyncHandler(async (req, res) => {
  const { sort } = req.query; // sort=price ili sort=time

  let orderBy = 'ra.created_at DESC';
  if (sort === 'price') orderBy = 'ra.proposed_price ASC NULLS LAST';
  if (sort === 'time')  orderBy = 'ra.proposed_completion ASC NULLS LAST';

  // Provjeri da li je owner tog repair requesta
  const isOwner = await db.query(
    `SELECT p.owner_id FROM repair_requests rr
     JOIN properties p ON p.id = rr.property_id
     WHERE rr.id = $1 AND p.owner_id = $2`,
    [req.params.id, req.user.id]
  );
  if (!isOwner.rows.length && req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { rows } = await db.query(
    `SELECT ra.repair_id, ra.worker_id, ra.proposed_completion, 
            ra.message, ra.proposed_price, ra.created_at,
            u.first_name, u.last_name, u.email, u.phone,
            w.bio, w.experience_years,
            ROUND(AVG(rv.rating), 2) AS avg_rating,
            COUNT(DISTINCT rv.id) AS review_count
     FROM repair_applications ra
     JOIN users u ON u.id = ra.worker_id
     JOIN workers w ON w.user_id = ra.worker_id
     LEFT JOIN reviews rv ON rv.worker_id = ra.worker_id
     WHERE ra.repair_id = $1
     GROUP BY ra.repair_id, ra.worker_id, ra.proposed_completion,
              ra.message, ra.proposed_price, ra.created_at,
              u.first_name, u.last_name, u.email, u.phone,
              w.bio, w.experience_years
     ORDER BY ${orderBy}`,
    [req.params.id]
  );
  res.json(rows);
});

// PATCH /api/repair-requests/:id/applications/:workerId/accept — owner prihvata
const acceptApplication = asyncHandler(async (req, res) => {
  // Provjeri da li je owner
  const isOwner = await db.query(
    `SELECT p.owner_id FROM repair_requests rr
     JOIN properties p ON p.id = rr.property_id
     WHERE rr.id = $1 AND p.owner_id = $2`,
    [req.params.id, req.user.id]
  );
  if (!isOwner.rows.length) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Dodijeli workera
    await client.query(
      'UPDATE repair_requests SET worker_id = $1 WHERE id = $2',
      [req.params.workerId, req.params.id]
    );

    // Promijeni status na in_progress
    const status = await client.query(
      "SELECT id FROM statuses WHERE name = 'in_progress' LIMIT 1"
    );
    if (status.rows.length) {
      await client.query(
        'UPDATE repair_requests SET status_id = $1 WHERE id = $2',
        [status.rows[0].id, req.params.id]
      );
    }

    await client.query('COMMIT');
    res.json({
      message: 'Application accepted',
      repair_id: parseInt(req.params.id),
      worker_id: parseInt(req.params.workerId),
    });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// DELETE /api/repair-requests/:id/applications/:workerId — worker povlaci aplikaciju
const deleteApplication = asyncHandler(async (req, res) => {
  if (req.user.id !== parseInt(req.params.workerId) && req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { rows } = await db.query(
    'DELETE FROM repair_applications WHERE repair_id = $1 AND worker_id = $2 RETURNING repair_id',
    [req.params.id, req.params.workerId]
  );
  if (!rows.length) return res.status(404).json({ error: 'Application not found' });
  res.status(204).end();
});

module.exports = {
  applyForRepair,
  listApplications,
  acceptApplication,
  deleteApplication,
};