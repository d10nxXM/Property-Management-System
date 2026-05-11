const router = require('express').Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/authorize');
const {
  listProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyImages,
  addPropertyImage,
  deletePropertyImage,
  getPropertyRepairs,
} = require('../controllers/properties.controller');

router.get('/',                        authenticate, listProperties);
router.post('/',                       authenticate, requireRole('PropertyOwner'), createProperty);
router.get('/:id',                     authenticate, getProperty);
router.patch('/:id',                   authenticate, updateProperty);
router.delete('/:id',                  authenticate, deleteProperty);
router.get('/:id/images',              authenticate, getPropertyImages);
router.post('/:id/images',             authenticate, requireRole('PropertyOwner'), addPropertyImage);
router.delete('/:id/images/:imgId',    authenticate, deletePropertyImage);
router.get('/:id/repair-requests',     authenticate, getPropertyRepairs);

module.exports = router;