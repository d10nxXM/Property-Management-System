const db = require('../db');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/admin/users — lista svih usera sa detaljima
const listAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const params = [];
  const where = [];

  let query = `
    SELECT u.id, u.first_name, u.last_name, u.email, u.phone,
           u.birth_date, u.created_at, r.name AS role,
           CASE 
             WHEN wo.user_id IS NOT NULL THEN true 
             ELSE false 
           END AS is_blocked
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN workers wo ON wo.user_id = u.id
  `;

  if (role) {
    params.push(role);
    where.push(`r.name = $${params.length}`);
  }

  if (where.length) query += ' WHERE ' + where.join(' AND ');
  query += ' ORDER BY u.created_at DESC';

  const offset = (parseInt(page) - 1) * parseInt(limit);
  params.push(parseInt(limit));
  query += ` LIMIT $${params.length}`;
  params.push(offset);
  query += ` OFFSET $${params.length}`;

  const { rows } = await db.query(query, params);

  // Ukupan broj usera
  const count = await db.query('SELECT COUNT(*) FROM users');

  res.json({
    page: parseInt(page),
    limit: parseInt(limit),
    total: parseInt(count.rows[0].count),
    users: rows,
  });
});

// GET /api/admin/users/:id — detalji jednog usera
const getUserDetails = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT u.id, u.first_name, u.last_name, u.email, u.phone,
            u.birth_date, u.created_at, r.name AS role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.id = $1`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'User not found' });

  // Ako je worker dohvati i worker detalje
  const worker = await db.query(
    `SELECT w.bio, w.experience_years,
            COALESCE(
              json_agg(DISTINCT jsonb_build_object('skill', s.name, 'level', sl.name))
              FILTER (WHERE s.id IS NOT NULL), '[]'
            ) AS skills,
            ROUND(AVG(r.rating), 2) AS avg_rating,
            COUNT(DISTINCT r.id) AS review_count
     FROM workers w
     LEFT JOIN worker_skills ws ON ws.worker_id = w.user_id
     LEFT JOIN skills s ON s.id = ws.skill_id
     LEFT JOIN skill_levels sl ON sl.id = ws.level_id
     LEFT JOIN reviews r ON r.worker_id = w.user_id
     WHERE w.user_id = $1
     GROUP BY w.user_id`,
    [req.params.id]
  );

  // Ako je owner dohvati i properties
  const properties = await db.query(
    `SELECT id, name, address FROM properties WHERE owner_id = $1`,
    [req.params.id]
  );

  res.json({
    ...rows[0],
    worker_details: worker.rows[0] || null,
    properties: properties.rows,
  });
});

// DELETE /api/admin/users/:id — obrisi usera
const deleteUser = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'User not found' });
  res.status(204).end();
});

// GET /api/admin/stats — statistike platforme
const getStats = asyncHandler(async (req, res) => {
  const [
    usersCount,
    workersCount,
    ownersCount,
    propertiesCount,
    repairsCount,
    repairsByStatus,
    reviewsCount,
    avgRating,
  ] = await Promise.all([
    db.query('SELECT COUNT(*) FROM users'),
    db.query("SELECT COUNT(*) FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'Worker'"),
    db.query("SELECT COUNT(*) FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'PropertyOwner'"),
    db.query('SELECT COUNT(*) FROM properties'),
    db.query('SELECT COUNT(*) FROM repair_requests'),
    db.query(`
      SELECT s.name AS status, COUNT(rr.id) AS count
      FROM repair_requests rr
      JOIN statuses s ON s.id = rr.status_id
      GROUP BY s.name
    `),
    db.query('SELECT COUNT(*) FROM reviews'),
    db.query('SELECT ROUND(AVG(rating), 2) AS avg FROM reviews'),
  ]);

  res.json({
    users: {
      total:   parseInt(usersCount.rows[0].count),
      workers: parseInt(workersCount.rows[0].count),
      owners:  parseInt(ownersCount.rows[0].count),
    },
    properties: parseInt(propertiesCount.rows[0].count),
    repairs: {
      total:     parseInt(repairsCount.rows[0].count),
      by_status: repairsByStatus.rows,
    },
    reviews: {
      total:      parseInt(reviewsCount.rows[0].count),
      avg_rating: parseFloat(avgRating.rows[0].avg) || 0,
    },
  });
});

// GET /api/admin/repairs — lista svih repair requestova
const listAllRepairs = asyncHandler(async (req, res) => {
  const { status_id, page = 1, limit = 20 } = req.query;
  const params = [];
  const where = [];

  let query = `
    SELECT rr.id, rr.description, rr.created_at, rr.estimated_completion,
           s.name AS status, u.name AS urgency, c.name AS category,
           p.name AS property_name,
           ow.first_name AS owner_first, ow.last_name AS owner_last,
           w.first_name AS worker_first, w.last_name AS worker_last
    FROM repair_requests rr
    LEFT JOIN statuses s ON s.id = rr.status_id
    LEFT JOIN urgencies u ON u.id = rr.urgency_id
    LEFT JOIN categories c ON c.id = rr.category_id
    LEFT JOIN properties p ON p.id = rr.property_id
    LEFT JOIN users ow ON ow.id = p.owner_id
    LEFT JOIN users w ON w.id = rr.worker_id
  `;

  if (status_id) {
    params.push(status_id);
    where.push(`rr.status_id = $${params.length}`);
  }

  if (where.length) query += ' WHERE ' + where.join(' AND ');
  query += ' ORDER BY rr.created_at DESC';

  const offset = (parseInt(page) - 1) * parseInt(limit);
  params.push(parseInt(limit));
  query += ` LIMIT $${params.length}`;
  params.push(offset);
  query += ` OFFSET $${params.length}`;

  const { rows } = await db.query(query, params);
  res.json({
    page: parseInt(page),
    limit: parseInt(limit),
    repairs: rows,
  });
});

// DELETE /api/admin/repairs/:id
const deleteRepair = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    'DELETE FROM repair_requests WHERE id = $1 RETURNING id',
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Repair not found' });
  res.status(204).end();
});

// PATCH /api/admin/repairs/:id/status
const updateRepairStatus = asyncHandler(async (req, res) => {
  const { status_id } = req.body;
  const { rows } = await db.query(
    'UPDATE repair_requests SET status_id = $1 WHERE id = $2 RETURNING *',
    [status_id, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Repair not found' });
  res.json(rows[0]);
});

module.exports = {
  listAllUsers,
  getUserDetails,
  deleteUser,
  getStats,
  listAllRepairs,
  deleteRepair,
  updateRepairStatus,
};