const router = require('express').Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/authorize');
const {
  listUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/users.controller');

// GET /api/users — samo admin
router.get('/', authenticate, requireRole('admin'), listUsers);

// GET /api/users/:id — svi ulogovani
router.get('/:id', authenticate, getUser);

// PATCH /api/users/:id — samo vlasnik acca ili admin
router.patch('/:id', authenticate, updateUser);

// DELETE /api/users/:id — samo admin
router.delete('/:id', authenticate, requireRole('Admin'), deleteUser);

module.exports = router;