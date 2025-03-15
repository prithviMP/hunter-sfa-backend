import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../../utils/requestUtils';
import * as contactManagementService from '../../../services/contactManagementService';
import { AppError } from '../../../middlewares/errorHandler';
import { getUserId } from '../../../core/auth/utils';

// ============ COMPANY CONTROLLERS ============

/**
 * Get all companies with filtering, sorting and pagination
 */
export const getCompanies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, search, type, status, areaId, regionId, isActive, sortBy, order } = req.query;
    
    const result = await contactManagementService.getCompanies(
      Number(page) || 1,
      Number(limit) || 10,
      {
        search: search as string,
        type: type as string,
        status: status as string,
        areaId: areaId as string,
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
 * Get company by ID
 */
export const getCompanyById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const company = await contactManagementService.getCompanyById(id);
    
    res.status(200).json({
      status: 'success',
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new company
 */
export const createCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const companyData = req.body;
    const company = await contactManagementService.createCompany(companyData, userId);
    
    res.status(201).json({
      status: 'success',
      data: company,
      message: 'Company created successfully and pending approval',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a company
 */
export const updateCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const company = await contactManagementService.updateCompany(id, req.body);
    
    res.status(200).json({
      status: 'success',
      data: company,
      message: 'Company updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a company
 */
export const approveCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = getUserId(req);
    
    const company = await contactManagementService.approveCompany(id, userId, reason);
    
    res.status(200).json({
      status: 'success',
      data: company,
      message: 'Company approved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a company
 */
export const rejectCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = getUserId(req);
    
    if (!reason) {
      throw new AppError('Reason is required for rejection', 400);
    }
    
    const company = await contactManagementService.rejectCompany(id, userId, reason);
    
    res.status(200).json({
      status: 'success',
      data: company,
      message: 'Company rejected successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate a company
 */
export const deactivateCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await contactManagementService.deactivateCompany(id);
    
    res.status(200).json({
      status: 'success',
      message: 'Company deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============ CONTACT CONTROLLERS ============

/**
 * Get contacts for a company
 */
export const getContactsByCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { companyId } = req.params;
    const { page, limit, search, isDecisionMaker, isActive, sortBy, order } = req.query;
    
    const result = await contactManagementService.getContactsByCompany(
      companyId,
      Number(page) || 1,
      Number(limit) || 10,
      {
        search: search as string,
        isDecisionMaker: isDecisionMaker === 'true',
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
 * Get contact by ID
 */
export const getContactById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const contact = await contactManagementService.getContactById(id);
    
    res.status(200).json({
      status: 'success',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a contact for a company
 */
export const createContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const contactData = req.body;
    const { companyId } = req.params;
    const contact = await contactManagementService.createContact(companyId, contactData);
    
    res.status(201).json({
      status: 'success',
      data: contact,
      message: 'Contact created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a contact
 */
export const updateContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const contact = await contactManagementService.updateContact(id, req.body);
    
    res.status(200).json({
      status: 'success',
      data: contact,
      message: 'Contact updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a contact
 */
export const deleteContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    await contactManagementService.deleteContact(id);
    
    res.status(200).json({
      status: 'success',
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}; 