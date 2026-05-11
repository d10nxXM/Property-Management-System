const db = require('../db');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/workers
const listWorkers = asyncHandler(async (req, res) => {
  const { skill_id, min_exp, city_id } = req.query;
  const params = [];
  const where = [];

  let query = `
    SELECT u.id, u.first_name, u.last_name, u.email, u.phone,
           w.bio, w.experience_years,
           COALESCE(
             json_agg(
               json_build_object('skill', s.name, 'level', sl.name)
             ) FILTER (WHERE s.id IS NOT NULL), '[]'
           ) AS skills,
           ROUND(AVG(r.rating), 2) AS avg_rating,
           COUNT(DISTINCT r.id) AS review_count
    FROM workers w
    JOIN users u ON u.id = w.user_id
    LEFT JOIN worker_skills ws ON ws.worker_id = w.user_id
    LEFT JOIN skills s ON s.id = ws.skill_id
    LEFT JOIN skill_levels sl ON sl.id = ws.level_id
    LEFT JOIN reviews r ON r.worker_id = w.user_id
  `;

  if (skill_id) { params.push(skill_id); where.push(`ws.skill_id = $${params.length}`); }
  if (min_exp)  { params.push(min_exp);  where.push(`w.experience_years >= $${params.length}`); }
  if (where.length) query += ' WHERE ' + where.join(' AND ');

  query += ' GROUP BY u.id, w.user_id ORDER BY avg_rating DESC NULLS LAST';

  const { rows } = await db.query(query, params);
  res.json(rows);
});

// GET /api/workers/:id
const getWorker = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT u.id, u.first_name, u.last_name, u.email, u.phone,
            w.bio, w.experience_years,
            COALESCE(
              json_agg(
                DISTINCT jsonb_build_object('skill_id', s.id, 'skill', s.name, 'level', sl.name)
              ) FILTER (WHERE s.id IS NOT NULL), '[]'
            ) AS skills,
            ROUND(AVG(r.rating), 2) AS avg_rating,
            COUNT(DISTINCT r.id) AS review_count
     FROM workers w
     JOIN users u ON u.id = w.user_id
     LEFT JOIN worker_skills ws ON ws.worker_id = w.user_id
     LEFT JOIN skills s ON s.id = ws.skill_id
     LEFT JOIN skill_levels sl ON sl.id = ws.level_id
     LEFT JOIN reviews r ON r.worker_id = w.user_id
     WHERE w.user_id = $1
     GROUP BY u.id, w.user_id`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Worker not found' });
  res.json(rows[0]);
});

// PATCH /api/workers/:id
const updateWorker = asyncHandler(async (req, res) => {
  if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { bio, experience_years } = req.body;
  const { rows } = await db.query(
    `UPDATE workers SET
       bio              = COALESCE($1, bio),
       experience_years = COALESCE($2, experience_years)
     WHERE user_id = $3 RETURNING *`,
    [bio, experience_years, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Worker not found' });
  res.json(rows[0]);
});

// GET /api/workers/:id/skills
const getWorkerSkills = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT s.id AS skill_id, s.name AS skill, sl.id AS level_id, sl.name AS level
     FROM worker_skills ws
     JOIN skills s ON s.id = ws.skill_id
     JOIN skill_levels sl ON sl.id = ws.level_id
     WHERE ws.worker_id = $1`,
    [req.params.id]
  );
  res.json(rows);
});

// PUT /api/workers/:id/skills
const setWorkerSkills = asyncHandler(async (req, res) => {
  if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { skills } = req.body;
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM worker_skills WHERE worker_id = $1', [req.params.id]);
    for (const { skill_id, level_id } of skills) {
      await client.query(
        'INSERT INTO worker_skills (worker_id, skill_id, level_id) VALUES ($1,$2,$3)',
        [req.params.id, skill_id, level_id]
      );
    }
    await client.query('COMMIT');
    res.json({ message: 'Skills updated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// DELETE /api/workers/:id/skills/:skillId
const removeWorkerSkill = asyncHandler(async (req, res) => {
  if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  await db.query(
    'DELETE FROM worker_skills WHERE worker_id = $1 AND skill_id = $2',
    [req.params.id, req.params.skillId]
  );
  res.status(204).end();
});

// GET /api/workers/:id/reviews
const getWorkerReviews = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT r.*, u.first_name, u.last_name
     FROM reviews r
     JOIN users u ON u.id = r.property_owner_id
     WHERE r.worker_id = $1 
     ORDER BY r.created_at DESC`,
    [req.params.id]
  );
  res.json(rows);
});

// GET /api/workers/:id/applications
const getWorkerApplications = asyncHandler(async (req, res) => {
  if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { rows } = await db.query(
    `SELECT ra.*, rr.description AS repair_description, 
            s.name AS status, p.name AS property_name
     FROM repair_applications ra
     JOIN repair_requests rr ON rr.id = ra.repair_id
     LEFT JOIN statuses s ON s.id = rr.status_id
     LEFT JOIN properties p ON p.id = rr.property_id
     WHERE ra.worker_id = $1 
     ORDER BY ra.created_at DESC`,
    [req.params.id]
  );
  res.json(rows);
});

module.exports = {
  listWorkers,
  getWorker,
  updateWorker,
  getWorkerSkills,
  setWorkerSkills,
  removeWorkerSkill,
  getWorkerReviews,
  getWorkerApplications,
};