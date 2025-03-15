import { Router } from 'express';
import { authenticate, authorize } from '../../../middlewares/authMiddleware';
import { validate } from '../../../middlewares/validationMiddleware';
import * as controllers from './controllers';
import * as schemas from './schemas';

const router = Router();

// All User Control routes require authentication
router.use(authenticate);

// ============ USER MANAGEMENT ============
/**
 * @route GET /api/v1/user-control/users
 * @desc Get all users with filtering, sorting and pagination
 * @access Private (requires read:users permission)
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Page size (default: 10)
 * @query {string} search - Search term for name, email, phone
 * @query {string} roleId - Filter by role ID
 * @query {string} departmentId - Filter by department ID
 * @query {boolean} isActive - Filter by active status
 * @query {string} sortBy - Field to sort by (default: createdAt)
 * @query {string} order - Sort order (asc/desc, default: desc)
 * @returns {Object} Users with pagination metadata
 */
router.get('/users', validate(schemas.getUsersSchema), authorize(['read:users']), controllers.getUsers);

/**
 * @route GET /api/v1/user-control/users/:id
 * @desc Get user by ID
 * @access Private (requires read:users permission)
 * @param {string} id - User ID
 * @returns {Object} User details
 */
router.get('/users/:id', authorize(['read:users']), controllers.getUserById);

/**
 * @route POST /api/v1/user-control/users
 * @desc Create a new user
 * @access Private (requires create:users permission)
 * @body {string} firstName - First name
 * @body {string} lastName - Last name
 * @body {string} email - Email address
 * @body {string} phoneNumber - Phone number
 * @body {string} password - Password
 * @body {string} roleId - Role ID
 * @body {string} departmentId - Department ID
 * @body {string[]} areaIds - Area IDs the user can access
 * @body {string[]} regionIds - Region IDs the user can access
 * @body {Object} address - User's address details (optional)
 * @body {string} profileImage - Profile image URL (optional)
 * @body {boolean} isActive - Active status (default: true)
 * @returns {Object} Created user details
 */
router.post('/users', validate(schemas.createUserSchema), authorize(['create:users']), controllers.createUser);

/**
 * @route PATCH /api/v1/user-control/users/:id
 * @desc Update a user
 * @access Private (requires update:users permission)
 * @param {string} id - User ID
 * @body {string} firstName - First name (optional)
 * @body {string} lastName - Last name (optional)
 * @body {string} email - Email address (optional)
 * @body {string} phoneNumber - Phone number (optional)
 * @body {string} roleId - Role ID (optional)
 * @body {string} departmentId - Department ID (optional)
 * @body {string[]} areaIds - Area IDs the user can access (optional)
 * @body {string[]} regionIds - Region IDs the user can access (optional)
 * @body {Object} address - User's address details (optional)
 * @body {string} profileImage - Profile image URL (optional)
 * @body {boolean} isActive - Active status (optional)
 * @returns {Object} Updated user details
 */
router.patch('/users/:id', validate(schemas.updateUserSchema), authorize(['update:users']), controllers.updateUser);

/**
 * @route DELETE /api/v1/user-control/users/:id
 * @desc Deactivate a user (soft delete)
 * @access Private (requires delete:users permission)
 * @param {string} id - User ID
 * @returns {Object} Success message
 */
router.delete('/users/:id', authorize(['delete:users']), controllers.deactivateUser);

/**
 * @route POST /api/v1/user-control/users/:id/reset-password
 * @desc Admin reset user password
 * @access Private (requires update:users permission)
 * @param {string} id - User ID
 * @body {string} newPassword - New password
 * @returns {Object} Success message
 */
router.post('/users/:id/reset-password', validate(schemas.resetPasswordSchema), authorize(['update:users']), controllers.resetUserPassword);

// ============ ROLE MANAGEMENT ============
/**
 * @route GET /api/v1/user-control/roles
 * @desc Get all roles with filtering, sorting and pagination
 * @access Private (requires read:roles permission)
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Page size (default: 10)
 * @query {string} search - Search term for name
 * @query {boolean} isActive - Filter by active status
 * @query {string} sortBy - Field to sort by (default: name)
 * @query {string} order - Sort order (asc/desc, default: asc)
 * @returns {Object} Roles with pagination metadata
 */
router.get('/roles', validate(schemas.getRolesSchema), authorize(['read:roles']), controllers.getRoles);

/**
 * @route GET /api/v1/user-control/roles/:id
 * @desc Get role by ID
 * @access Private (requires read:roles permission)
 * @param {string} id - Role ID
 * @returns {Object} Role details with permissions
 */
router.get('/roles/:id', authorize(['read:roles']), controllers.getRoleById);

/**
 * @route POST /api/v1/user-control/roles
 * @desc Create a new role
 * @access Private (requires create:roles permission)
 * @body {string} name - Role name
 * @body {string} description - Role description (optional)
 * @body {string[]} permissions - Permission IDs or strings
 * @body {boolean} isDefault - Whether this is a default role (optional)
 * @body {boolean} isActive - Active status (default: true)
 * @returns {Object} Created role details
 */
router.post('/roles', validate(schemas.createRoleSchema), authorize(['create:roles']), controllers.createRole);

/**
 * @route PATCH /api/v1/user-control/roles/:id
 * @desc Update a role
 * @access Private (requires update:roles permission)
 * @param {string} id - Role ID
 * @body {string} name - Role name (optional)
 * @body {string} description - Role description (optional)
 * @body {string[]} permissions - Permission IDs or strings (optional)
 * @body {boolean} isDefault - Whether this is a default role (optional)
 * @body {boolean} isActive - Active status (optional)
 * @returns {Object} Updated role details
 */
router.patch('/roles/:id', validate(schemas.updateRoleSchema), authorize(['update:roles']), controllers.updateRole);

/**
 * @route DELETE /api/v1/user-control/roles/:id
 * @desc Deactivate a role (soft delete)
 * @access Private (requires delete:roles permission)
 * @param {string} id - Role ID
 * @returns {Object} Success message
 */
router.delete('/roles/:id', authorize(['delete:roles']), controllers.deactivateRole);

/**
 * @route GET /api/v1/user-control/permissions
 * @desc Get all available permissions
 * @access Private (requires read:roles permission)
 * @returns {Object} List of all available permissions grouped by module
 */
router.get('/permissions', authorize(['read:roles']), controllers.getAllPermissions);

// ============ DEPARTMENT MANAGEMENT ============
/**
 * @route GET /api/v1/user-control/departments
 * @desc Get all departments with filtering, sorting and pagination
 * @access Private (requires read:departments permission)
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Page size (default: 10)
 * @query {string} search - Search term for name
 * @query {boolean} isActive - Filter by active status
 * @query {string} sortBy - Field to sort by (default: name)
 * @query {string} order - Sort order (asc/desc, default: asc)
 * @returns {Object} Departments with pagination metadata
 */
router.get('/departments', validate(schemas.getDepartmentsSchema), authorize(['read:departments']), controllers.getDepartments);

/**
 * @route GET /api/v1/user-control/departments/:id
 * @desc Get department by ID
 * @access Private (requires read:departments permission)
 * @param {string} id - Department ID
 * @returns {Object} Department details
 */
router.get('/departments/:id', authorize(['read:departments']), controllers.getDepartmentById);

/**
 * @route POST /api/v1/user-control/departments
 * @desc Create a new department
 * @access Private (requires create:departments permission)
 * @body {string} name - Department name
 * @body {string} code - Department code
 * @body {string} description - Department description (optional)
 * @body {string} parentId - Parent department ID (optional)
 * @body {string} managerId - Manager user ID (optional)
 * @body {boolean} isActive - Active status (default: true)
 * @returns {Object} Created department details
 */
router.post('/departments', validate(schemas.createDepartmentSchema), authorize(['create:departments']), controllers.createDepartment);

/**
 * @route PATCH /api/v1/user-control/departments/:id
 * @desc Update a department
 * @access Private (requires update:departments permission)
 * @param {string} id - Department ID
 * @body {string} name - Department name (optional)
 * @body {string} code - Department code (optional)
 * @body {string} description - Department description (optional)
 * @body {string} parentId - Parent department ID (optional)
 * @body {string} managerId - Manager user ID (optional)
 * @body {boolean} isActive - Active status (optional)
 * @returns {Object} Updated department details
 */
router.patch('/departments/:id', validate(schemas.updateDepartmentSchema), authorize(['update:departments']), controllers.updateDepartment);

/**
 * @route DELETE /api/v1/user-control/departments/:id
 * @desc Deactivate a department (soft delete)
 * @access Private (requires delete:departments permission)
 * @param {string} id - Department ID
 * @returns {Object} Success message
 */
router.delete('/departments/:id', authorize(['delete:departments']), controllers.deactivateDepartment);

// ============ APP MANAGEMENT ============
/**
 * @route GET /api/v1/user-control/apps
 * @desc Get all apps with filtering, sorting and pagination
 * @access Private (requires read:apps permission)
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Page size (default: 10)
 * @query {string} search - Search term for name
 * @query {boolean} isActive - Filter by active status
 * @query {string} sortBy - Field to sort by (default: name)
 * @query {string} order - Sort order (asc/desc, default: asc)
 * @returns {Object} Apps with pagination metadata
 */
router.get('/apps', validate(schemas.getAppsSchema), authorize(['read:apps']), controllers.getApps);

/**
 * @route GET /api/v1/user-control/apps/:id
 * @desc Get app by ID
 * @access Private (requires read:apps permission)
 * @param {string} id - App ID
 * @returns {Object} App details
 */
router.get('/apps/:id', authorize(['read:apps']), controllers.getAppById);

/**
 * @route POST /api/v1/user-control/apps
 * @desc Create a new app
 * @access Private (requires create:apps permission)
 * @body {string} name - App name
 * @body {string} key - App unique key
 * @body {string} description - App description (optional)
 * @body {string} iconUrl - App icon URL (optional)
 * @body {string} baseUrl - App base URL (optional)
 * @body {boolean} isActive - Active status (default: true)
 * @returns {Object} Created app details
 */
router.post('/apps', validate(schemas.createAppSchema), authorize(['create:apps']), controllers.createApp);

/**
 * @route PATCH /api/v1/user-control/apps/:id
 * @desc Update an app
 * @access Private (requires update:apps permission)
 * @param {string} id - App ID
 * @body {string} name - App name (optional)
 * @body {string} key - App unique key (optional)
 * @body {string} description - App description (optional)
 * @body {string} iconUrl - App icon URL (optional)
 * @body {string} baseUrl - App base URL (optional)
 * @body {boolean} isActive - Active status (optional)
 * @returns {Object} Updated app details
 */
router.patch('/apps/:id', validate(schemas.updateAppSchema), authorize(['update:apps']), controllers.updateApp);

/**
 * @route DELETE /api/v1/user-control/apps/:id
 * @desc Deactivate an app (soft delete)
 * @access Private (requires delete:apps permission)
 * @param {string} id - App ID
 * @returns {Object} Success message
 */
router.delete('/apps/:id', authorize(['delete:apps']), controllers.deactivateApp);

// ============ EMAIL & ROLE REGION MANAGEMENT ============
/**
 * @route GET /api/v1/user-control/email-configurations
 * @desc Get all email configurations with filtering, sorting and pagination
 * @access Private (requires read:email-configurations permission)
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Page size (default: 10)
 * @query {string} search - Search term for name or email
 * @query {string} roleId - Filter by role ID
 * @query {string} regionId - Filter by region ID
 * @query {boolean} isActive - Filter by active status
 * @returns {Object} Email configurations with pagination metadata
 */
router.get('/email-configurations', validate(schemas.getEmailConfigsSchema), authorize(['read:email-configurations']), controllers.getEmailConfigurations);

/**
 * @route GET /api/v1/user-control/email-configurations/:id
 * @desc Get email configuration by ID
 * @access Private (requires read:email-configurations permission)
 * @param {string} id - Email configuration ID
 * @returns {Object} Email configuration details
 */
router.get('/email-configurations/:id', authorize(['read:email-configurations']), controllers.getEmailConfigurationById);

/**
 * @route POST /api/v1/user-control/email-configurations
 * @desc Create a new email configuration
 * @access Private (requires create:email-configurations permission)
 * @body {string} name - Configuration name
 * @body {string} email - Email address
 * @body {string} roleId - Role ID
 * @body {string} regionId - Region ID
 * @body {boolean} isActive - Active status (default: true)
 * @returns {Object} Created email configuration details
 */
router.post('/email-configurations', validate(schemas.createEmailConfigSchema), authorize(['create:email-configurations']), controllers.createEmailConfiguration);

/**
 * @route PATCH /api/v1/user-control/email-configurations/:id
 * @desc Update an email configuration
 * @access Private (requires update:email-configurations permission)
 * @param {string} id - Email configuration ID
 * @body {string} name - Configuration name (optional)
 * @body {string} email - Email address (optional)
 * @body {string} roleId - Role ID (optional)
 * @body {string} regionId - Region ID (optional)
 * @body {boolean} isActive - Active status (optional)
 * @returns {Object} Updated email configuration details
 */
router.patch('/email-configurations/:id', validate(schemas.updateEmailConfigSchema), authorize(['update:email-configurations']), controllers.updateEmailConfiguration);

/**
 * @route DELETE /api/v1/user-control/email-configurations/:id
 * @desc Deactivate an email configuration (soft delete)
 * @access Private (requires delete:email-configurations permission)
 * @param {string} id - Email configuration ID
 * @returns {Object} Success message
 */
router.delete('/email-configurations/:id', authorize(['delete:email-configurations']), controllers.deactivateEmailConfiguration);

// ============ NOTIFICATION MANAGEMENT ============
/**
 * @route GET /api/v1/user-control/notifications
 * @desc Get all notifications for the current user
 * @access Private (authenticated user)
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Page size (default: 10)
 * @query {boolean} isRead - Filter by read status
 * @query {string} sortBy - Field to sort by (default: createdAt)
 * @query {string} order - Sort order (asc/desc, default: desc)
 * @returns {Object} Notifications with pagination metadata
 */
router.get('/notifications', validate(schemas.getNotificationsSchema), controllers.getUserNotifications);

/**
 * @route PATCH /api/v1/user-control/notifications/:id
 * @desc Mark a notification as read
 * @access Private (authenticated user)
 * @param {string} id - Notification ID
 * @returns {Object} Updated notification
 */
router.patch('/notifications/:id', controllers.markNotificationAsRead);

/**
 * @route PATCH /api/v1/user-control/notifications
 * @desc Mark all notifications as read
 * @access Private (authenticated user)
 * @returns {Object} Success message
 */
router.patch('/notifications', controllers.markAllNotificationsAsRead);

/**
 * @route DELETE /api/v1/user-control/notifications/:id
 * @desc Delete a notification
 * @access Private (authenticated user)
 * @param {string} id - Notification ID
 * @returns {Object} Success message
 */
router.delete('/notifications/:id', controllers.deleteNotification);

// ============ SETTINGS MANAGEMENT ============
/**
 * @route GET /api/v1/user-control/settings/user
 * @desc Get current user settings
 * @access Private (authenticated user)
 * @returns {Object} User settings
 */
router.get('/settings/user', controllers.getUserSettings);

/**
 * @route PATCH /api/v1/user-control/settings/user
 * @desc Update current user settings
 * @access Private (authenticated user)
 * @body {Object} notifications - Notification preferences
 * @body {Object} display - Display preferences
 * @body {Object} dashboard - Dashboard preferences
 * @returns {Object} Updated user settings
 */
router.patch('/settings/user', validate(schemas.updateUserSettingsSchema), controllers.updateUserSettings);

/**
 * @route GET /api/v1/user-control/settings/system
 * @desc Get system settings
 * @access Private (requires read:settings permission)
 * @returns {Object} System settings
 */
router.get('/settings/system', authorize(['read:settings']), controllers.getSystemSettings);

/**
 * @route PATCH /api/v1/user-control/settings/system
 * @desc Update system settings
 * @access Private (requires update:settings permission)
 * @body {Object} email - Email settings
 * @body {Object} security - Security settings
 * @body {Object} localization - Localization settings
 * @body {Object} branding - Branding settings
 * @returns {Object} Updated system settings
 */
router.patch('/settings/system', validate(schemas.updateSystemSettingsSchema), authorize(['update:settings']), controllers.updateSystemSettings);

// Export router
export default router; 