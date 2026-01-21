const express = require('express');
const router = express.Router();
const invController = require('../controllers/invController'); 

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory item detail view
router.get("/detail/:inv_id", invController.buildByInventoryId);

router.get("/error-test", (req, res, next) => {
  throw new Error("Intentional 500 Error - Assignment 3 Test");
});

module.exports = router;