const router = require('express').Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/authorize');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const {
  listReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews.controller');

router.get('/',     authenticate, listReviews);
router.get('/:id',  authenticate, getReview);

router.post('/',
  authenticate,
  requireRole('PropertyOwner'),
  [
    body('worker_id').isInt().withMessage('Worker ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('description').notEmpty().withMessage('Description is required'),
  ],
  validate,
  createReview
);

router.patch('/:id',  authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

module.exports = router;