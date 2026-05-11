const router = require('express').Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/authorize');
const {
  listRepairs,
  getRepair,
  createRepair,
  updateRepair,
  deleteRepair,
  addRepairImage,
  deleteRepairImage,
  assignWorker,
} = require('../controllers/repairs.controller');

router.get('/',    authenticate, listRepairs);
router.post('/',   authenticate, requireRole('PropertyOwner'), createRepair);
router.get('/:id', authenticate, getRepair);
router.patch('/:id', authenticate, updateRepair);
router.delete('/:id', authenticate, requireRole('PropertyOwner'), deleteRepair);
router.post('/:id/images', authenticate, addRepairImage);
router.delete('/:id/images/:imgId', authenticate, deleteRepairImage);
router.post('/:id/assign/:workerId', authenticate, requireRole('PropertyOwner'), assignWorker);

const {
  applyForRepair,
  listApplications,
  acceptApplication,
  deleteApplication,
} = require('../controllers/applications.controller');

// Applications
router.post('/:id/applications', authenticate, requireRole('Worker'), applyForRepair);
router.get('/:id/applications',  authenticate, requireRole('PropertyOwner'), listApplications);
router.patch('/:id/applications/:workerId/accept', authenticate, requireRole('PropertyOwner'), acceptApplication);
router.delete('/:id/applications/:workerId', authenticate, deleteApplication);

module.exports = router;