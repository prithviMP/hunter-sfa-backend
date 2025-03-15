import { Router } from 'express';
import { authenticate, authorize } from '../../../middlewares/authMiddleware';
import { validate } from '../../../middlewares/validationMiddleware';
import * as controllers from './controllers';
import * as schemas from './schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============ COMPANY ROUTES ============

/**
 * @route GET /api/v1/contact-management/companies
 * @desc Get all companies with filtering, sorting and pagination
 * @access Private (requires read:companies permission)
 */
router.get('/companies', validate(schemas.getCompaniesSchema), authorize(['read:companies']), controllers.getCompanies);

/**
 * @route GET /api/v1/contact-management/companies/:id
 * @desc Get company by ID
 * @access Private (requires read:companies permission)
 */
router.get('/companies/:id', authorize(['read:companies']), controllers.getCompanyById);

/**
 * @route POST /api/v1/contact-management/companies
 * @desc Create a new company
 * @access Private (requires create:companies permission)
 */
router.post('/companies', validate(schemas.createCompanySchema), authorize(['create:companies']), controllers.createCompany);

/**
 * @route PATCH /api/v1/contact-management/companies/:id
 * @desc Update a company
 * @access Private (requires update:companies permission)
 */
router.patch('/companies/:id', validate(schemas.updateCompanySchema), authorize(['update:companies']), controllers.updateCompany);

/**
 * @route DELETE /api/v1/contact-management/companies/:id
 * @desc Deactivate a company
 * @access Private (requires delete:companies permission)
 */
router.delete('/companies/:id', authorize(['delete:companies']), controllers.deactivateCompany);

/**
 * @route POST /api/v1/contact-management/companies/:id/approve
 * @desc Approve a company
 * @access Private (requires update:companies permission)
 */
router.post('/companies/:id/approve', validate(schemas.approveRejectCompanySchema), authorize(['update:companies']), controllers.approveCompany);

/**
 * @route POST /api/v1/contact-management/companies/:id/reject
 * @desc Reject a company
 * @access Private (requires update:companies permission)
 */
router.post('/companies/:id/reject', validate(schemas.approveRejectCompanySchema), authorize(['update:companies']), controllers.rejectCompany);

// ============ CONTACT ROUTES ============

/**
 * @route GET /api/v1/contact-management/companies/:companyId/contacts
 * @desc Get contacts for a company
 * @access Private (requires read:companies permission)
 */
router.get('/companies/:companyId/contacts', validate(schemas.getContactsSchema), authorize(['read:companies']), controllers.getContactsByCompany);

/**
 * @route GET /api/v1/contact-management/contacts/:id
 * @desc Get contact by ID
 * @access Private (requires read:companies permission)
 */
router.get('/contacts/:id', authorize(['read:companies']), controllers.getContactById);

/**
 * @route POST /api/v1/contact-management/companies/:companyId/contacts
 * @desc Create a contact for a company
 * @access Private (requires create:companies permission)
 */
router.post('/companies/:companyId/contacts', validate(schemas.createContactSchema), authorize(['create:companies']), controllers.createContact);

/**
 * @route PATCH /api/v1/contact-management/contacts/:id
 * @desc Update a contact
 * @access Private (requires update:companies permission)
 */
router.patch('/contacts/:id', validate(schemas.updateContactSchema), authorize(['update:companies']), controllers.updateContact);

/**
 * @route DELETE /api/v1/contact-management/contacts/:id
 * @desc Delete a contact
 * @access Private (requires delete:companies permission)
 */
router.delete('/contacts/:id', authorize(['delete:companies']), controllers.deleteContact);

export default router; 