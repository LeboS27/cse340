
const regValidate = require('../utilities/account-validation');
const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const utilities = require('../utilities');

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Route to build account management view (requires login)
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement));  // Updated this line

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
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

router.get("/error-test", (req, res, next) => {
  throw new Error("Intentional 500 Error - Accounts Route Test");
});

module.exports = router;
