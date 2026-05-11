const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const asyncHandler = require('../middleware/asyncHandler');

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { first_name, last_name, email, password, phone, birth_date, role } = req.body;

  const { rows: roleRows } = await db.query(
    'SELECT id FROM roles WHERE name = $1', [role]
  );
  if (!roleRows.length) {
    return res.status(400).json({ error: `Invalid role: ${role}` });
  }
  const role_id = roleRows[0].id;

  const existing = await db.query(
    'SELECT id FROM users WHERE email = $1', [email]
  );
  if (existing.rows.length) {
    return res.status(409).json({ error: 'Email already in use' });
  }

  const password_hash = await bcrypt.hash(password, 12);

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO users 
        (first_name, last_name, email, password_hash, phone, birth_date, role_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) 
       RETURNING id, email, first_name, last_name`,
      [first_name, last_name, email, password_hash, phone || null, birth_date || null, role_id]
    );
    const user = rows[0];

    if (role === 'PropertyOwner') {
      await client.query(
        `INSERT INTO property_owners (user_id, preferred_contact_method) 
         VALUES ($1, $2)`,
        [user.id, req.body.preferred_contact_method || null]
      );
    } else if (role === 'Worker') {
      await client.query(
        `INSERT INTO workers (user_id, bio, experience_years) 
         VALUES ($1, $2, $3)`,
        [user.id, req.body.bio || null, req.body.experience_years || null]
      );
    }

    await client.query('COMMIT');

    const token = generateToken(user.id);
    res.status(201).json({ token, user: { ...user, role } });

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { rows } = await db.query(
    `SELECT u.*, r.name AS role 
     FROM users u 
     JOIN roles r ON u.role_id = r.id 
     WHERE u.email = $1`,
    [email]
  );

  if (!rows.length) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user.id);
  res.json({
    token,
    user: {
      id:         user.id,
      email:      user.email,
      first_name: user.first_name,
      last_name:  user.last_name,
      role:       user.role,
    },
  });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, 
            u.birth_date, u.created_at, r.name AS role
     FROM users u 
     JOIN roles r ON u.role_id = r.id 
     WHERE u.id = $1`,
    [req.user.id]
  );
  res.json(rows[0]);
});

module.exports = { register, login, me };