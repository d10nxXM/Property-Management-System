const router = require('express').Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/authorize');
const {
  listAllUsers,
  getUserDetails,
  deleteUser,
  getStats,
  listAllRepairs,
  deleteRepair,
  updateRepairStatus,
} = require('../controllers/admin.controller');

// Svi admin ruti zahtijevaju Admin rolu
router.use(authenticate, requireRole('Admin'));

// Stats
router.get('/stats', getStats);

// Users
router.get('/users',      listAllUsers);
router.get('/users/:id',  getUserDetails);
router.delete('/users/:id', deleteUser);

// Repairs
router.get('/repairs',              listAllRepairs);
router.delete('/repairs/:id',       deleteRepair);
router.patch('/repairs/:id/status', updateRepairStatus);

module.exports = router;