
const pool = require('../database/');

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
  } catch (error) {
    return error.message;
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email]);
    return result.rows[0];
  } catch (error) {
    return new Error("No matching email found");
  }
}

/* ****************************************
* Get account by ID
* *************************************** */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_created FROM account WHERE account_id = $1',
      [account_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("getAccountById error: ", error);
    throw new Error("Database error fetching account");
  }
}

/* ****************************************
* Get all accounts (for admin only)
* *************************************** */
async function getAllAccounts() {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_created FROM account ORDER BY account_created DESC'
    );
    return result.rows;
  } catch (error) {
    console.error("getAllAccounts error: ", error);
    throw new Error("Database error fetching accounts");
  }
}

/* ****************************************
* Update account profile (non-admin fields)
* *************************************** */
async function updateAccountProfile(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = `
      UPDATE account 
      SET account_firstname = $1, account_lastname = $2, account_email = $3 
      WHERE account_id = $4 
      RETURNING account_id, account_firstname, account_lastname, account_email, account_type
    `;
    const result = await pool.query(sql, [
      account_firstname, 
      account_lastname, 
      account_email, 
      account_id
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("updateAccountProfile error: ", error);
    throw new Error("Database error updating account");
  }
}

/* ****************************************
* Update account type (admin only)
* *************************************** */
async function updateAccountType(account_id, account_type) {
  try {
    const sql = `
      UPDATE account 
      SET account_type = $1 
      WHERE account_id = $2 
      RETURNING account_id, account_firstname, account_lastname, account_email, account_type
    `;
    const result = await pool.query(sql, [account_type, account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("updateAccountType error: ", error);
    throw new Error("Database error updating account type");
  }
}

/* ****************************************
* Log account activity
* *************************************** */
async function logAccountActivity(account_id, activity_type, activity_details) {
  try {
    const sql = `
      INSERT INTO account_activity (account_id, activity_type, activity_details) 
      VALUES ($1, $2, $3) 
      RETURNING activity_id
    `;
    await pool.query(sql, [account_id, activity_type, activity_details]);
  } catch (error) {
    console.error("logAccountActivity error: ", error);
  }
}


module.exports = { 
  registerAccount,
  getAccountByEmail,
  getAccountById,        
  getAllAccounts,        
  updateAccountProfile,  
  updateAccountType,     
  logAccountActivity     
};