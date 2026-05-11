const router = require('express').Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/authorize');
const c = require('../controllers/lookup.controller');

const adminOnly = [authenticate, requireRole('Admin')];

// Roles — samo lista, niko ne kreira role kroz API
router.get('/roles', authenticate, c.listRoles);

// Cities
router.get('/cities',        authenticate, c.listCities);
router.post('/cities',       ...adminOnly,  c.createCity);
router.delete('/cities/:id', ...adminOnly,  c.deleteCity);

// Skills
router.get('/skills',        authenticate, c.listSkills);
router.post('/skills',       ...adminOnly,  c.createSkill);
router.delete('/skills/:id', ...adminOnly,  c.deleteSkill);

// Skill Levels
router.get('/skill-levels',        authenticate, c.listSkillLevels);
router.post('/skill-levels',       ...adminOnly,  c.createSkillLevel);
router.delete('/skill-levels/:id', ...adminOnly,  c.deleteSkillLevel);

// Categories
router.get('/categories',        authenticate, c.listCategories);
router.post('/categories',       ...adminOnly,  c.createCategory);
router.delete('/categories/:id', ...adminOnly,  c.deleteCategory);

// Statuses
router.get('/statuses',        authenticate, c.listStatuses);
router.post('/statuses',       ...adminOnly,  c.createStatus);
router.delete('/statuses/:id', ...adminOnly,  c.deleteStatus);

// Urgencies
router.get('/urgencies',        authenticate, c.listUrgencies);
router.post('/urgencies',       ...adminOnly,  c.createUrgency);
router.delete('/urgencies/:id', ...adminOnly,  c.deleteUrgency);

module.exports = router;