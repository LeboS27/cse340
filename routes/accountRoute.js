const regValidate = require('../utilities/account-validation');
const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const utilities = require('../utilities');
const { body, validationResult } = require('express-validator');

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Route to build account management view (requires login)
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement));

// NEW: Route to user management dashboard
router.get("/manage", utilities.checkLogin, utilities.handleErrors(accountController.buildManagementDashboard));

// NEW: Update user profile
router.post(
  "/update-profile",
  utilities.checkLogin,
  [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
  ],
  utilities.handleErrors(accountController.updateUserProfile)
);

// NEW: Update account type (admin only)
router.post(
  "/update-type",
  utilities.checkLogin,
  utilities.handleErrors(accountController.updateUserAccountType)
);

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.accountLogin)
);

router.get("/error-test", (req, res, next) => {
  throw new Error("Intentional 500 Error - Accounts Route Test");
});

module.exports = router;