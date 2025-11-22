const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController.cjs');
router.get('/', productController.getAllProducts);

// generate sku preview for frontend (must be before '/:id' to avoid route conflicts)
router.post('/generate-sku', productController.generateSKU);

router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
// stock endpoint
router.get('/:id/stock', productController.getProductStock);
// compatibility route used in UI previously
router.get('/:id/locations', productController.getProductLocations);
router.get('/categories/list', productController.getCategories);

module.exports = router;
