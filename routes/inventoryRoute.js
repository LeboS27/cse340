const express = require('express');
const router = express.Router();
const invController = require('../controllers/invController');
const utilities = require('../utilities');
const invValidate = require('../utilities/inventory-validation'); // Add this line

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory item detail view
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInventoryId));

// Route to build inventory management view
router.get("/management", utilities.checkLogin, utilities.handleErrors(invController.buildManagementView));

// Route to build edit inventory view
router.get("/edit/:inv_id", utilities.checkLogin, utilities.handleErrors(invController.editInventoryView));

// Route to handle inventory update
router.post("/update", 
  invValidate.addInventoryRules(),
  invValidate.checkUpdateData,
  utilities.checkLogin,
  utilities.handleErrors(invController.updateInventory)
);

// Route to get inventory by classification as JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

router.get("/error-test", (req, res, next) => {
  throw new Error("Intentional 500 Error - Assignment 3 Test");
});

module.exports = router;