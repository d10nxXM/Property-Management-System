const db = require('../db');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/users
const listUsers = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, 
            u.birth_date, u.created_at, r.name AS role
     FROM users u 
     JOIN roles r ON u.role_id = r.id
     ORDER BY u.created_at DESC`
  );
  res.json(rows);
});

// GET /api/users/:id
const getUser = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT u.id, u.first_name, u.last_name, u.email, u.phone,
            u.birth_date, u.created_at, r.name AS role
     FROM users u 
     JOIN roles r ON u.role_id = r.id 
     WHERE u.id = $1`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'User not found' });
  res.json(rows[0]);
});

// PATCH /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { first_name, last_name, phone, birth_date } = req.body;

  const { rows } = await db.query(
    `UPDATE users SET
       first_name = COALESCE($1, first_name),
       last_name  = COALESCE($2, last_name),
       phone      = COALESCE($3, phone),
       birth_date = COALESCE($4, birth_date)
     WHERE id = $5
     RETURNING id, first_name, last_name, email, phone, birth_date`,
    [first_name, last_name, phone, birth_date, id]
  );
  if (!rows.length) return res.status(404).json({ error: 'User not found' });
  res.json(rows[0]);
});

// DELETE /api/users/:id  (admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'User not found' });
  res.status(204).end();
});

module.exports = { listUsers, getUser, updateUser, deleteUser };