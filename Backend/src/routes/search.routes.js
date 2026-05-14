const router = require('express').Router();
const authenticate = require('../middleware/auth');
const {
  quickSearch,
  searchWorkers,
  searchRepairs,
  searchProperties,
} = require('../controllers/search.controller');

router.get('/quick',      authenticate, quickSearch);
router.get('/workers',    authenticate, searchWorkers);
router.get('/repairs',    authenticate, searchRepairs);
router.get('/properties', authenticate, searchProperties);

module.exports = router;