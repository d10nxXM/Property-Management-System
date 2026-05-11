const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, me } = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/register',
  [
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').isIn(['PropertyOwner', 'Worker']).withMessage('Role must be owner or worker'),
  ],
  validate,
  register
);

router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/me', authenticate, me);

module.exports = router;