const router = require('express').Router();
const authenticate = require('../middleware/auth');
const upload = require('../config/multer');
const {
  uploadProfileImage,
  deleteProfileImage,
  getProfileImages,
  uploadPropertyImage,
  deletePropertyImage,
  uploadRepairImage,
  deleteRepairImage,
} = require('../controllers/upload.controller');

// Profile images
router.get('/profile',             authenticate, getProfileImages);
router.post('/profile',            authenticate, upload.single('image'), uploadProfileImage);
router.delete('/profile/:imageId', authenticate, deleteProfileImage);

// Property images
router.post('/property/:propertyId',             authenticate, upload.single('image'), uploadPropertyImage);
router.delete('/property/:propertyId/:imageId',  authenticate, deletePropertyImage);

// Repair images
router.post('/repair/:repairId',           authenticate, upload.single('image'), uploadRepairImage);
router.delete('/repair/:repairId/:imageId', authenticate, deleteRepairImage);

module.exports = router;