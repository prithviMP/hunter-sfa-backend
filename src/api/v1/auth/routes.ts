import { Router } from 'express';
import { authenticate } from '../../../middlewares/authMiddleware';
import { validate } from '../../../middlewares/validationMiddleware';
import * as controllers from './controllers';
import * as schemas from './schemas';

const router = Router();

/**
 * @route POST /api/v1/auth/login
 * @desc Login user and get tokens
 * @access Public
 * @body {string} username - Username or email
 * @body {string} password - Password
 * @body {boolean} rememberMe - Whether to remember the user (optional)
 * @returns {Object} User data and tokens
 */
router.post('/login', validate(schemas.loginSchema), controllers.login);

/**
 * @route POST /api/v1/auth/signup
 * @desc Register a new user
 * @access Public
 * @body {string} firstName - First name
 * @body {string} lastName - Last name
 * @body {string} email - Email address
 * @body {string} username - Username
 * @body {string} password - Password
 * @body {string} confirmPassword - Confirm password
 * @body {string} phoneNumber - Phone number (optional)
 * @returns {Object} Created user
 */
router.post('/signup', validate(schemas.signupSchema), controllers.signup);

/**
 * @route POST /api/v1/auth/refresh-token
 * @desc Refresh access token
 * @access Public
 * @body {string} refreshToken - Refresh token (optional if in cookie)
 * @returns {Object} New tokens
 */
router.post('/refresh-token', validate(schemas.refreshTokenSchema), controllers.refreshAccessToken);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user
 * @access Public
 * @body {string} refreshToken - Refresh token (optional if in cookie)
 * @returns {Object} Success message
 */
router.post('/logout', validate(schemas.logoutSchema), controllers.logout);

/**
 * @route GET /api/v1/auth/profile
 * @desc Get current user profile
 * @access Private
 * @returns {Object} User profile
 */
router.get('/profile', authenticate, controllers.getProfile);

export default router; 