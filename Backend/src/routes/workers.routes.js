const router = require('express').Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/authorize');
const {
  listWorkers,
  getWorker,
  updateWorker,
  getWorkerSkills,
  setWorkerSkills,
  removeWorkerSkill,
  getWorkerReviews,
  getWorkerApplications,
} = require('../controllers/workers.controller');

router.get('/',                       authenticate, listWorkers);
router.get('/:id',                    authenticate, getWorker);
router.patch('/:id',                  authenticate, updateWorker);
router.get('/:id/skills',             authenticate, getWorkerSkills);
router.put('/:id/skills',             authenticate, setWorkerSkills);
router.delete('/:id/skills/:skillId', authenticate, removeWorkerSkill);
router.get('/:id/reviews',            authenticate, getWorkerReviews);
router.get('/:id/applications',       authenticate, getWorkerApplications);

module.exports = router;