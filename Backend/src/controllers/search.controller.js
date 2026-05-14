const db = require('../db');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/search/quick?q=keyword
const quickSearch = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Search query is required' });

  const search = `%${q}%`;

  const [workers, properties, repairs] = await Promise.all([
    // Workers
    db.query(
      `SELECT u.id, u.first_name, u.last_name, w.bio, w.experience_years,
              ROUND(AVG(r.rating), 2) AS avg_rating,
              'worker' AS type
       FROM workers w
       JOIN users u ON u.id = w.user_id
       LEFT JOIN reviews r ON r.worker_id = w.user_id
       WHERE u.first_name ILIKE $1 
          OR u.last_name ILIKE $1 
          OR w.bio ILIKE $1
       GROUP BY u.id, w.user_id
       LIMIT 5`,
      [search]
    ),
    // Properties
    db.query(
      `SELECT p.id, p.name, p.address, p.description,
              c.name AS city,
              u.first_name AS owner_first, u.last_name AS owner_last,
              'property' AS type
       FROM properties p
       LEFT JOIN cities c ON c.id = p.city_id
       LEFT JOIN users u ON u.id = p.owner_id
       WHERE p.name ILIKE $1 
          OR p.address ILIKE $1 
          OR p.description ILIKE $1
          OR c.name ILIKE $1
       LIMIT 5`,
      [search]
    ),
    // Repair Requests
    db.query(
      `SELECT rr.id, rr.description, rr.created_at,
              s.name AS status, u.name AS urgency, c.name AS category,
              p.name AS property_name,
              'repair' AS type
       FROM repair_requests rr
       LEFT JOIN statuses s ON s.id = rr.status_id
       LEFT JOIN urgencies u ON u.id = rr.urgency_id
       LEFT JOIN categories c ON c.id = rr.category_id
       LEFT JOIN properties p ON p.id = rr.property_id
       WHERE rr.description ILIKE $1
          OR c.name ILIKE $1
          OR p.name ILIKE $1
       LIMIT 5`,
      [search]
    ),
  ]);

  res.json({
    query: q,
    results: {
      workers:    workers.rows,
      properties: properties.rows,
      repairs:    repairs.rows,
    },
  });
});

// GET /api/search/workers
const searchWorkers = asyncHandler(async (req, res) => {
  const {
    q,
    skill_id,
    level_id,
    min_exp,
    max_exp,
    min_rating,
    city_id,
    sort = 'rating',
    page = 1,
    limit = 10,
  } = req.query;

  const params = [];
  const where = [];
  const joins = [];

  let query = `
    SELECT u.id, u.first_name, u.last_name, u.email, u.phone,
           w.bio, w.experience_years,
           COALESCE(
             json_agg(DISTINCT jsonb_build_object('skill', s.name, 'level', sl.name))
             FILTER (WHERE s.id IS NOT NULL), '[]'
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

  if (q) {
    params.push(`%${q}%`);
    where.push(`(u.first_name ILIKE $${params.length} OR u.last_name ILIKE $${params.length} OR w.bio ILIKE $${params.length})`);
  }
  if (skill_id) {
    params.push(skill_id);
    where.push(`ws.skill_id = $${params.length}`);
  }
  if (level_id) {
    params.push(level_id);
    where.push(`ws.level_id = $${params.length}`);
  }
  if (min_exp) {
    params.push(min_exp);
    where.push(`w.experience_years >= $${params.length}`);
  }
  if (max_exp) {
    params.push(max_exp);
    where.push(`w.experience_years <= $${params.length}`);
  }

  if (where.length) query += ' WHERE ' + where.join(' AND ');

  query += ' GROUP BY u.id, w.user_id';

  if (min_rating) {
    params.push(min_rating);
    query += ` HAVING ROUND(AVG(r.rating), 2) >= $${params.length}`;
  }

  // Sorting
  if (sort === 'rating')     query += ' ORDER BY avg_rating DESC NULLS LAST';
  if (sort === 'experience') query += ' ORDER BY w.experience_years DESC';
  if (sort === 'reviews')    query += ' ORDER BY review_count DESC';

  // Pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);
  params.push(parseInt(limit));
  query += ` LIMIT $${params.length}`;
  params.push(offset);
  query += ` OFFSET $${params.length}`;

  const { rows } = await db.query(query, params);
  res.json({
    page: parseInt(page),
    limit: parseInt(limit),
    results: rows,
  });
});

// GET /api/search/repairs
const searchRepairs = asyncHandler(async (req, res) => {
  const {
    q,
    category_id,
    urgency_id,
    status_id,
    city_id,
    from_date,
    to_date,
    sort = 'newest',
    page = 1,
    limit = 10,
  } = req.query;

  const params = [];
  const where = [];

  let query = `
    SELECT rr.id, rr.description, rr.estimated_completion, rr.created_at,
           s.name AS status, urg.name AS urgency, c.name AS category,
           p.name AS property_name, p.address,
           ct.name AS city,
           COALESCE(json_agg(ri.image_url) FILTER (WHERE ri.id IS NOT NULL), '[]') AS images
    FROM repair_requests rr
    LEFT JOIN statuses s ON s.id = rr.status_id
    LEFT JOIN urgencies urg ON urg.id = rr.urgency_id
    LEFT JOIN categories c ON c.id = rr.category_id
    LEFT JOIN properties p ON p.id = rr.property_id
    LEFT JOIN cities ct ON ct.id = p.city_id
    LEFT JOIN repair_images ri ON ri.repair_id = rr.id
  `;

  if (q) {
    params.push(`%${q}%`);
    where.push(`(rr.description ILIKE $${params.length} OR c.name ILIKE $${params.length} OR p.name ILIKE $${params.length})`);
  }
  if (category_id) {
    params.push(category_id);
    where.push(`rr.category_id = $${params.length}`);
  }
  if (urgency_id) {
    params.push(urgency_id);
    where.push(`rr.urgency_id = $${params.length}`);
  }
  if (status_id) {
    params.push(status_id);
    where.push(`rr.status_id = $${params.length}`);
  }
  if (city_id) {
    params.push(city_id);
    where.push(`p.city_id = $${params.length}`);
  }
  if (from_date) {
    params.push(from_date);
    where.push(`rr.created_at >= $${params.length}`);
  }
  if (to_date) {
    params.push(to_date);
    where.push(`rr.created_at <= $${params.length}`);
  }

  if (where.length) query += ' WHERE ' + where.join(' AND ');

  query += ' GROUP BY rr.id, s.name, urg.name, c.name, p.name, p.address, ct.name';

  // Sorting
  if (sort === 'newest')   query += ' ORDER BY rr.created_at DESC';
  if (sort === 'oldest')   query += ' ORDER BY rr.created_at ASC';
  if (sort === 'urgency')  query += ' ORDER BY urg.id DESC';

  // Pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);
  params.push(parseInt(limit));
  query += ` LIMIT $${params.length}`;
  params.push(offset);
  query += ` OFFSET $${params.length}`;

  const { rows } = await db.query(query, params);
  res.json({
    page: parseInt(page),
    limit: parseInt(limit),
    results: rows,
  });
});

// GET /api/search/properties
const searchProperties = asyncHandler(async (req, res) => {
  const {
    q,
    city_id,
    owner_id,
    sort = 'newest',
    page = 1,
    limit = 10,
  } = req.query;

  const params = [];
  const where = [];

  let query = `
    SELECT p.id, p.name, p.address, p.description, p.created_at,
           c.name AS city,
           u.first_name AS owner_first, u.last_name AS owner_last,
           COALESCE(json_agg(pi.image_url) FILTER (WHERE pi.id IS NOT NULL), '[]') AS images
    FROM properties p
    LEFT JOIN cities c ON c.id = p.city_id
    LEFT JOIN users u ON u.id = p.owner_id
    LEFT JOIN property_images pi ON pi.property_id = p.id
  `;

  if (q) {
    params.push(`%${q}%`);
    where.push(`(p.name ILIKE $${params.length} OR p.address ILIKE $${params.length} OR p.description ILIKE $${params.length} OR c.name ILIKE $${params.length})`);
  }
  if (city_id) {
    params.push(city_id);
    where.push(`p.city_id = $${params.length}`);
  }
  if (owner_id) {
    params.push(owner_id);
    where.push(`p.owner_id = $${params.length}`);
  }

  if (where.length) query += ' WHERE ' + where.join(' AND ');

  query += ' GROUP BY p.id, c.name, u.first_name, u.last_name';

  if (sort === 'newest') query += ' ORDER BY p.created_at DESC';
  if (sort === 'oldest') query += ' ORDER BY p.created_at ASC';
  if (sort === 'name')   query += ' ORDER BY p.name ASC';

  const offset = (parseInt(page) - 1) * parseInt(limit);
  params.push(parseInt(limit));
  query += ` LIMIT $${params.length}`;
  params.push(offset);
  query += ` OFFSET $${params.length}`;

  const { rows } = await db.query(query, params);
  res.json({
    page: parseInt(page),
    limit: parseInt(limit),
    results: rows,
  });
});

module.exports = { quickSearch, searchWorkers, searchRepairs, searchProperties };