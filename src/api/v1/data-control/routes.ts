import { Router } from 'express';
import { authenticate, authorize } from '../../../middlewares/authMiddleware';
import { validate } from '../../../middlewares/validationMiddleware';
import * as controllers from './controllers';
import * as schemas from './schemas';

const router = Router();

// All Data Control routes require authentication
router.use(authenticate);

// ============ AREA MANAGEMENT ============
router.get('/areas', validate(schemas.getAreasSchema), authorize(['read:areas']), controllers.getAreas);
router.post('/areas', validate(schemas.areaSchema), authorize(['create:areas']), controllers.createArea);
router.get('/areas/:id', authorize(['read:areas']), controllers.getAreaById);
router.patch('/areas/:id', validate(schemas.updateAreaSchema), authorize(['update:areas']), controllers.updateArea);

// ============ BRAND MANAGEMENT ============
router.get('/brands', validate(schemas.getBrandsSchema), authorize(['read:brands']), controllers.getBrands);
router.post('/brands', validate(schemas.brandSchema), authorize(['create:brands']), controllers.createBrand);
router.get('/brands/:id', authorize(['read:brands']), controllers.getBrandById);
router.patch('/brands/:id', validate(schemas.updateBrandSchema), authorize(['update:brands']), controllers.updateBrand);

// ============ HSN CODE MANAGEMENT ============
router.get('/hsn-codes', validate(schemas.getHsnCodesSchema), authorize(['read:hsn-codes']), controllers.getHsnCodes);
router.post('/hsn-codes', validate(schemas.hsnCodeSchema), authorize(['create:hsn-codes']), controllers.createHsnCode);
router.get('/hsn-codes/:id', authorize(['read:hsn-codes']), controllers.getHsnCodeById);
router.patch('/hsn-codes/:id', validate(schemas.updateHsnCodeSchema), authorize(['update:hsn-codes']), controllers.updateHsnCode);

// ============ CITY/STATE MANAGEMENT ============
router.get('/states', validate(schemas.getStatesSchema), authorize(['read:states']), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'This endpoint will return states with pagination and filtering',
  });
});

router.post('/states', validate(schemas.stateSchema), authorize(['create:states']), (req, res) => {
  res.status(201).json({
    status: 'success',
    message: 'This endpoint will create a new state',
  });
});

router.get('/cities', validate(schemas.getCitiesSchema), authorize(['read:cities']), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'This endpoint will return cities with pagination and filtering',
  });
});

router.post('/cities', validate(schemas.citySchema), authorize(['create:cities']), (req, res) => {
  res.status(201).json({
    status: 'success',
    message: 'This endpoint will create a new city',
  });
});

// ============ EMAIL TEMPLATES ============
router.get('/email-templates', validate(schemas.getEmailTemplatesSchema), authorize(['read:email-templates']), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'This endpoint will return email templates',
  });
});

router.post('/email-templates', validate(schemas.emailTemplateSchema), authorize(['create:email-templates']), (req, res) => {
  res.status(201).json({
    status: 'success',
    message: 'This endpoint will create a new email template',
  });
});

router.get('/email-templates/:id', authorize(['read:email-templates']), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: `This endpoint will return email template with ID: ${req.params.id}`,
  });
});

router.patch('/email-templates/:id', validate(schemas.updateEmailTemplateSchema), authorize(['update:email-templates']), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: `This endpoint will update email template with ID: ${req.params.id}`,
  });
});

// ============ PDF TEMPLATES ============
router.get('/pdf-templates', validate(schemas.getPdfTemplatesSchema), authorize(['read:pdf-templates']), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'This endpoint will return PDF templates',
  });
});

router.post('/pdf-templates', validate(schemas.pdfTemplateSchema), authorize(['create:pdf-templates']), (req, res) => {
  res.status(201).json({
    status: 'success',
    message: 'This endpoint will create a new PDF template',
  });
});

router.get('/pdf-templates/:id', authorize(['read:pdf-templates']), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: `This endpoint will return PDF template with ID: ${req.params.id}`,
  });
});

router.patch('/pdf-templates/:id', validate(schemas.updatePdfTemplateSchema), authorize(['update:pdf-templates']), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: `This endpoint will update PDF template with ID: ${req.params.id}`,
  });
});

// ============ SHORTCODES ============
router.get('/shortcodes', validate(schemas.getShortcodesSchema), authorize(['read:shortcodes']), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'This endpoint will return shortcodes',
  });
});

router.post('/shortcodes', validate(schemas.shortcodeSchema), authorize(['create:shortcodes']), (req, res) => {
  res.status(201).json({
    status: 'success',
    message: 'This endpoint will create a new shortcode',
  });
});

router.get('/shortcodes/:id', authorize(['read:shortcodes']), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: `This endpoint will return shortcode with ID: ${req.params.id}`,
  });
});

router.patch('/shortcodes/:id', validate(schemas.updateShortcodeSchema), authorize(['update:shortcodes']), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: `This endpoint will update shortcode with ID: ${req.params.id}`,
  });
});

// ============ IMPORT/EXPORT ============
router.post('/import/companies', validate(schemas.importCompanySchema), authorize(['create:companies']), controllers.importCompanies);
router.post('/import/contacts', validate(schemas.importContactSchema), authorize(['create:contacts']), controllers.importContacts);
router.get('/export/companies', validate(schemas.exportQuerySchema), authorize(['read:companies']), controllers.exportCompanies);
router.get('/export/contacts', validate(schemas.exportQuerySchema), authorize(['read:contacts']), controllers.exportContacts);

router.get('/export/products', validate(schemas.exportQuerySchema), authorize(['read:products']), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'This endpoint will export products data',
  });
});

router.get('/export/invoices', validate(schemas.exportQuerySchema), authorize(['read:invoices']), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'This endpoint will export invoices data',
  });
});

export default router; 