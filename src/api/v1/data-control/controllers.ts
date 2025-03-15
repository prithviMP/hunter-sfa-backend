import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../../utils/requestUtils';
import * as dataControlService from '../../../services/dataControlService';
import { AppError } from '../../../middlewares/errorHandler';

// ============ AREA CONTROLLERS ============

/**
 * Get all areas with filtering and pagination
 */
export const getAreas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, search, cityId, stateId, sortBy, order } = req.query;
    
    const result = await dataControlService.getAreas(
      Number(page) || 1,
      Number(limit) || 10,
      {
        search: search as string,
        cityId: cityId as string,
        stateId: stateId as string,
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
 * Get area by ID
 */
export const getAreaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const area = await dataControlService.getAreaById(id);
    
    res.status(200).json({
      status: 'success',
      data: area,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new area
 */
export const createArea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const area = await dataControlService.createArea(req.body);
    
    res.status(201).json({
      status: 'success',
      data: area,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an area
 */
export const updateArea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const area = await dataControlService.updateArea(id, req.body);
    
    res.status(200).json({
      status: 'success',
      data: area,
    });
  } catch (error) {
    next(error);
  }
};

// ============ BRAND CONTROLLERS ============

/**
 * Get all brands with filtering and pagination
 */
export const getBrands = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, search, isCompetitor, sortBy, order } = req.query;
    
    const result = await dataControlService.getBrands(
      Number(page) || 1,
      Number(limit) || 10,
      {
        search: search as string,
        isCompetitor: isCompetitor === 'true',
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
 * Get brand by ID
 */
export const getBrandById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const brand = await dataControlService.getBrandById(id);
    
    res.status(200).json({
      status: 'success',
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new brand
 */
export const createBrand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const brand = await dataControlService.createBrand(req.body);
    
    res.status(201).json({
      status: 'success',
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a brand
 */
export const updateBrand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const brand = await dataControlService.updateBrand(id, req.body);
    
    res.status(200).json({
      status: 'success',
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

// ============ HSN CODE CONTROLLERS ============

/**
 * Get all HSN codes with filtering and pagination
 */
export const getHsnCodes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, search, sortBy, order } = req.query;
    
    const result = await dataControlService.getHsnCodes(
      Number(page) || 1,
      Number(limit) || 10,
      {
        search: search as string,
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
 * Get HSN code by ID
 */
export const getHsnCodeById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const hsnCode = await dataControlService.getHsnCodeById(id);
    
    res.status(200).json({
      status: 'success',
      data: hsnCode,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new HSN code
 */
export const createHsnCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hsnCode = await dataControlService.createHsnCode(req.body);
    
    res.status(201).json({
      status: 'success',
      data: hsnCode,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an HSN code
 */
export const updateHsnCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const hsnCode = await dataControlService.updateHsnCode(id, req.body);
    
    res.status(200).json({
      status: 'success',
      data: hsnCode,
    });
  } catch (error) {
    next(error);
  }
};

// ============ IMPORT/EXPORT CONTROLLERS ============

/**
 * Import companies from CSV/Excel
 */
export const importCompanies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // This would be implemented with a file upload middleware and import logic
    res.status(200).json({
      status: 'success',
      message: 'Companies imported successfully',
      data: {
        imported: 10,
        failed: 2,
        errors: [
          { row: 3, error: 'Duplicate company code' },
          { row: 5, error: 'Invalid area ID' },
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Import contacts from CSV/Excel
 */
export const importContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // This would be implemented with a file upload middleware and import logic
    res.status(200).json({
      status: 'success',
      message: 'Contacts imported successfully',
      data: {
        imported: 15,
        failed: 3,
        errors: [
          { row: 2, error: 'Missing required field: name' },
          { row: 7, error: 'Invalid company ID' },
          { row: 9, error: 'Invalid email format' },
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export companies to CSV/Excel
 */
export const exportCompanies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // This would be implemented with CSV/Excel generation logic
    // For now, just return a success message
    res.status(200).json({
      status: 'success',
      message: 'Company export initiated',
      data: {
        downloadUrl: '/downloads/companies_export_123456.csv',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export contacts to CSV/Excel
 */
export const exportContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // This would be implemented with CSV/Excel generation logic
    // For now, just return a success message
    res.status(200).json({
      status: 'success',
      message: 'Contact export initiated',
      data: {
        downloadUrl: '/downloads/contacts_export_123456.csv',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    });
  } catch (error) {
    next(error);
  }
}; 