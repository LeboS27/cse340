
const jwt = require("jsonwebtoken");
require("dotenv").config();
const utilities = require('../utilities');
const accountModel = require('../models/account-model');
const bcrypt = require('bcryptjs');

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav(req, res, next);
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav(req, res, next);
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav(req, res);
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before storing
  const hashedPassword = await bcrypt.hash(account_password, 10);

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav(req, res);
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });
      
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }
      
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error('Access Forbidden');
  }
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav(req, res, next);
  
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  });
}

/* ****************************************
* Build account management dashboard
* *************************************** */
async function buildManagementDashboard(req, res, next) {
  try {
    let nav = await utilities.getNav(req, res);
    const accountData = res.locals.accountData;
    
    // Check if user is admin
    if (accountData.account_type === 'Admin') {
      // Admin view: get all accounts
      const allAccounts = await accountModel.getAllAccounts();
      
      // Log admin access
      await accountModel.logAccountActivity(
        accountData.account_id, 
        'ADMIN_ACCESS', 
        'Accessed user management dashboard'
      );
      
      res.render("account/admin-dashboard", {
        title: "User Management Dashboard",
        nav,
        accounts: allAccounts,
        currentUser: accountData,
        messages: req.flash() || {}
      });
    } else {
      // Regular user: get their own profile
      const userAccount = await accountModel.getAccountById(accountData.account_id);
      
      res.render("account/user-profile", {
        title: "My Profile",
        nav,
        account: userAccount,
        errors: null,
        messages: req.flash() || {}
      });
    }
  } catch (error) {
    console.error("buildManagementDashboard error: ", error);
    next(error);
  }
}

/* ****************************************
* Update user profile (for regular users)
* *************************************** */
async function updateUserProfile(req, res, next) {
  try {
    let nav = await utilities.getNav(req, res);
    const accountData = res.locals.accountData;
    const { account_firstname, account_lastname, account_email } = req.body;
    
    // Validation rules
    const validationRules = [
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
    ];
    
    // Apply validation
    await Promise.all(validationRules.map(validation => validation.run(req)));
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      // Return to form with errors
      const userAccount = await accountModel.getAccountById(accountData.account_id);
      
      return res.render("account/user-profile", {
        title: "My Profile",
        nav,
        account: userAccount,
        errors: errors.array(),
        messages: req.flash() || {}
      });
    }
    
    // Update profile
    const updatedAccount = await accountModel.updateAccountProfile(
      accountData.account_id,
      account_firstname,
      account_lastname,
      account_email
    );
    
    // Log activity
    await accountModel.logAccountActivity(
      accountData.account_id,
      'PROFILE_UPDATE',
      `Updated profile information`
    );
    
    req.flash("success", "Your profile has been updated successfully!");
    res.redirect("/account/manage");
    
  } catch (error) {
    console.error("updateUserProfile error: ", error);
    req.flash("error", "Failed to update profile. Please try again.");
    res.redirect("/account/manage");
  }
}

/* ****************************************
* Update account type (admin only)
* *************************************** */
async function updateUserAccountType(req, res, next) {
  try {
    const accountData = res.locals.accountData;
    const { target_account_id, new_account_type } = req.body;
    
    // Authorization check
    if (accountData.account_type !== 'Admin') {
      req.flash("error", "Unauthorized action.");
      return res.redirect("/account/manage");
    }
    
    // Prevent self-modification
    if (parseInt(target_account_id) === accountData.account_id) {
      req.flash("error", "Cannot modify your own account type.");
      return res.redirect("/account/manage");
    }
    
    // Update account type
    const updatedAccount = await accountModel.updateAccountType(
      target_account_id,
      new_account_type
    );
    
    // Log activity
    await accountModel.logAccountActivity(
      accountData.account_id,
      'ACCOUNT_TYPE_UPDATE',
      `Changed account type for user ${target_account_id} to ${new_account_type}`
    );
    
    req.flash("success", `Account type updated successfully for ${updatedAccount.account_firstname} ${updatedAccount.account_lastname}`);
    res.redirect("/account/manage");
    
  } catch (error) {
    console.error("updateUserAccountType error: ", error);
    req.flash("error", "Failed to update account type.");
    res.redirect("/account/manage");
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildManagement,
  buildManagementDashboard,  
  updateUserProfile,         
  updateUserAccountType      
};