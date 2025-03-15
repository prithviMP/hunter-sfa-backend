import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../../utils/requestUtils';
import * as userControlService from '../../../services/userControlService';
import { AppError } from '../../../middlewares/errorHandler';
import { getUserId } from '../../../core/auth/utils';

// ============ USER CONTROLLERS ============

/**
 * Get all users with filtering, sorting and pagination
 */
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, search, roleId, departmentId, isActive, sortBy, order } = req.query;
    
    const result = await userControlService.getUsers(
      Number(page) || 1,
      Number(limit) || 10,
      {
        search: search as string,
        roleId: roleId as string,
        departmentId: departmentId as string,
        isActive: isActive === 'true',
        sortBy: sortBy as string,
        order: order as 'asc' | 'desc',
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await userControlService.getUserById(id);
    
    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userControlService.createUser(req.body);
    
    res.status(201).json({
      status: 'success',
      data: user,
      message: 'User created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a user
 */
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await userControlService.updateUser(id, req.body);
    
    res.status(200).json({
      status: 'success',
      data: user,
      message: 'User updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate a user (soft delete)
 */
export const deactivateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await userControlService.deactivateUser(id);
    
    res.status(200).json({
      status: 'success',
      message: 'User deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin reset user password
 */
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    await userControlService.resetUserPassword(id, newPassword);
    
    res.status(200).json({
      status: 'success',
      message: 'User password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============ ROLE CONTROLLERS ============

/**
 * Get all roles with filtering, sorting and pagination
 */
export const getRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, search, isActive, sortBy, order } = req.query;
    
    const result = await userControlService.getRoles(
      Number(page) || 1,
      Number(limit) || 10,
      {
        search: search as string,
        isActive: isActive === 'true',
        sortBy: sortBy as string,
        order: order as 'asc' | 'desc',
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get role by ID
 */
export const getRoleById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const role = await userControlService.getRoleById(id);
    
    res.status(200).json({
      status: 'success',
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new role
 */
export const createRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const role = await userControlService.createRole(req.body);
    
    res.status(201).json({
      status: 'success',
      data: role,
      message: 'Role created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a role
 */
export const updateRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const role = await userControlService.updateRole(id, req.body);
    
    res.status(200).json({
      status: 'success',
      data: role,
      message: 'Role updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate a role (soft delete)
 */
export const deactivateRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await userControlService.deactivateRole(id);
    
    res.status(200).json({
      status: 'success',
      message: 'Role deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all available permissions
 */
export const getAllPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const permissions = await userControlService.getAllPermissions();
    
    res.status(200).json({
      status: 'success',
      data: permissions,
    });
  } catch (error) {
    next(error);
  }
};

// ============ DEPARTMENT CONTROLLERS ============

/**
 * Get all departments with filtering, sorting and pagination
 */
export const getDepartments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, search, isActive, sortBy, order } = req.query;
    
    const result = await userControlService.getDepartments(
      Number(page) || 1,
      Number(limit) || 10,
      {
        search: search as string,
        isActive: isActive === 'true',
        sortBy: sortBy as string,
        order: order as 'asc' | 'desc',
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get department by ID
 */
export const getDepartmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const department = await userControlService.getDepartmentById(id);
    
    res.status(200).json({
      status: 'success',
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new department
 */
export const createDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const department = await userControlService.createDepartment(req.body);
    
    res.status(201).json({
      status: 'success',
      data: department,
      message: 'Department created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a department
 */
export const updateDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const department = await userControlService.updateDepartment(id, req.body);
    
    res.status(200).json({
      status: 'success',
      data: department,
      message: 'Department updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate a department (soft delete)
 */
export const deactivateDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await userControlService.deactivateDepartment(id);
    
    res.status(200).json({
      status: 'success',
      message: 'Department deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============ APP CONTROLLERS ============

/**
 * Get all apps with filtering, sorting and pagination
 */
export const getApps = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, search, isActive, sortBy, order } = req.query;
    
    const result = await userControlService.getApps(
      Number(page) || 1,
      Number(limit) || 10,
      {
        search: search as string,
        isActive: isActive === 'true',
        sortBy: sortBy as string,
        order: order as 'asc' | 'desc',
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get app by ID
 */
export const getAppById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const app = await userControlService.getAppById(id);
    
    res.status(200).json({
      status: 'success',
      data: app,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new app
 */
export const createApp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const app = await userControlService.createApp(req.body);
    
    res.status(201).json({
      status: 'success',
      data: app,
      message: 'App created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an app
 */
export const updateApp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const app = await userControlService.updateApp(id, req.body);
    
    res.status(200).json({
      status: 'success',
      data: app,
      message: 'App updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate an app (soft delete)
 */
export const deactivateApp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await userControlService.deactivateApp(id);
    
    res.status(200).json({
      status: 'success',
      message: 'App deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============ EMAIL CONFIGURATION CONTROLLERS ============

/**
 * Get all email configurations with filtering, sorting and pagination
 */
export const getEmailConfigurations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, search, roleId, regionId, isActive, sortBy, order } = req.query;
    
    const result = await userControlService.getEmailConfigurations(
      Number(page) || 1,
      Number(limit) || 10,
      {
        search: search as string,
        roleId: roleId as string,
        regionId: regionId as string,
        isActive: isActive === 'true',
        sortBy: sortBy as string,
        order: order as 'asc' | 'desc',
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get email configuration by ID
 */
export const getEmailConfigurationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const emailConfig = await userControlService.getEmailConfigurationById(id);
    
    res.status(200).json({
      status: 'success',
      data: emailConfig,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new email configuration
 */
export const createEmailConfiguration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const emailConfig = await userControlService.createEmailConfiguration(req.body);
    
    res.status(201).json({
      status: 'success',
      data: emailConfig,
      message: 'Email configuration created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an email configuration
 */
export const updateEmailConfiguration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const emailConfig = await userControlService.updateEmailConfiguration(id, req.body);
    
    res.status(200).json({
      status: 'success',
      data: emailConfig,
      message: 'Email configuration updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate an email configuration (soft delete)
 */
export const deactivateEmailConfiguration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await userControlService.deactivateEmailConfiguration(id);
    
    res.status(200).json({
      status: 'success',
      message: 'Email configuration deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============ NOTIFICATION CONTROLLERS ============

/**
 * Get all notifications for the current user
 */
export const getUserNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, isRead, sortBy, order } = req.query;
    const userId = getUserId(req);
    
    const result = await userControlService.getUserNotifications(
      userId,
      Number(page) || 1,
      Number(limit) || 10,
      {
        isRead: isRead === 'true',
        sortBy: sortBy as string,
        order: order as 'asc' | 'desc',
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    
    const notification = await userControlService.markNotificationAsRead(id, userId);
    
    res.status(200).json({
      status: 'success',
      data: notification,
      message: 'Notification marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    
    await userControlService.markAllNotificationsAsRead(userId);
    
    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    
    await userControlService.deleteNotification(id, userId);
    
    res.status(200).json({
      status: 'success',
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============ SETTINGS CONTROLLERS ============

/**
 * Get current user settings
 */
export const getUserSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    
    const settings = await userControlService.getUserSettings(userId);
    
    res.status(200).json({
      status: 'success',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user settings
 */
export const updateUserSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    
    const settings = await userControlService.updateUserSettings(userId, req.body);
    
    res.status(200).json({
      status: 'success',
      data: settings,
      message: 'User settings updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get system settings
 */
export const getSystemSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settings = await userControlService.getSystemSettings();
    
    res.status(200).json({
      status: 'success',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update system settings
 */
export const updateSystemSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settings = await userControlService.updateSystemSettings(req.body);
    
    res.status(200).json({
      status: 'success',
      data: settings,
      message: 'System settings updated successfully',
    });
  } catch (error) {
    next(error);
  }
}; 