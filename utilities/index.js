const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()


/* ****************************************
 *  Check if user is Admin
 * ************************************ */
Util.isAdmin = (req, res, next) => {
  if (res.locals.loggedin && res.locals.accountData.account_type === 'Admin') {
    next();
  } else {
    req.flash("error", "Access denied. Admin privileges required.");
    res.redirect("/account/");
  }
};

/* ****************************************
 *  Check if user is Employee or Admin
 * ************************************ */
Util.isEmployee = (req, res, next) => {
  if (res.locals.loggedin && 
      (res.locals.accountData.account_type === 'Employee' || 
       res.locals.accountData.account_type === 'Admin')) {
    next();
  } else {
    req.flash("error", "Access denied. Employee or Admin privileges required.");
    res.redirect("/account/");
  }
};

/* ************************
 * Constructs the nav HTML unordered list
 * Updated to show Admin link for admin users
 ************************** */
Util.getNav = async function (req, res, next) {
  try {
    let data = await invModel.getClassifications()
    
    if (!data || !data.rows) {
      console.log("No classification data found, using mock data")
      const mockClassifications = [
        { classification_id: 1, classification_name: "Custom" },
        { classification_id: 2, classification_name: "Sport" },
        { classification_id: 3, classification_name: "SUV" },
        { classification_id: 4, classification_name: "Truck" },
        { classification_id: 5, classification_name: "Sedan" }
      ]
      data = { rows: mockClassifications }
    }
    
    // Initialize list variable
    let list = '<ul class="nav-menu">'
    list += '<li><a href="/" title="Home page">Home</a></li>'
    
    data.rows.forEach((row) => {
      list += '<li>'
      list += '<a href="/inv/type/' + row.classification_id + 
              '" title="See our inventory of ' + row.classification_name + 
              ' vehicles">' + row.classification_name + '</a>'
      list += '</li>'
    })
    
    // Check if user is logged in - handle case when res is undefined
    let loggedin = false
    let isAdmin = false
    
    if (res && res.locals) {
      if (res.locals.loggedin) {
        loggedin = true
      }
      // Check if user is admin
      if (res.locals.accountData && res.locals.accountData.account_type === 'Admin') {
        isAdmin = true
      }
    }
    
    if (loggedin) {
      // When logged in, show "Inventory Management" instead of "My Account"
      list += '<li><a href="/inv/management" title="Manage Inventory">Inventory Management</a></li>'
      
      // Add User Management link for admin users
      if (isAdmin) {
        list += '<li><a href="/account/manage" title="User Management">User Management</a></li>'
      }
      
      list += '<li><a href="/account/" title="Your Account">My Account</a></li>'
    } else {
      // When logged out, show login link
      list += '<li><a href="/account/login" title="Login to your account">My Account</a></li>'
    }
    
    list += '</ul>'
    return list
  } catch (error) {
    console.error('Error in getNav:', error)
    // Return a basic nav in case of error
    return '<ul class="nav-menu"><li><a href="/" title="Home page">Home</a></li><li><a href="/account/login" title="Login to your account">My Account</a></li></ul>'
  }
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
 * Build the inventory detail view HTML
 * ************************************ */
Util.buildDetailGrid = function(data){
  if (!data) {
    return '<p class="notice">Vehicle not found.</p>';
  }
  
  // Format price as USD
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(data.inv_price);
  
  const formattedMileage = new Intl.NumberFormat().format(data.inv_miles);
  
  let grid = '<div class="vehicle-detail-container">';
  grid += '<div class="vehicle-detail">';
  grid += '<div class="vehicle-image">';
  grid += `<img src="${data.inv_image}" alt="${data.inv_make} ${data.inv_model}" class="detail-img">`;
  grid += '</div>';
  grid += '<div class="vehicle-info">';
  grid += `<h2>${data.inv_year} ${data.inv_make} ${data.inv_model}</h2>`;
  grid += `<p><strong>Price:</strong> ${formattedPrice}</p>`;
  grid += `<p><strong>Mileage:</strong> ${formattedMileage} miles</p>`;
  grid += `<p><strong>Color:</strong> ${data.inv_color}</p>`;
  grid += `<p><strong>Description:</strong> ${data.inv_description}</p>`;
  grid += '</div>';
  grid += '</div>';
  grid += '</div>';
  
  return grid;
}

/* ************************
 * Build classification list HTML for select
 ************************** */
Util.buildClassificationList = async function (classification_id = 0) {
  let data = await invModel.getClassifications()
  
  if (!data || !data.rows) {
    console.log("No classification data found, using mock data")
    const mockClassifications = [
      { classification_id: 1, classification_name: "Custom" },
      { classification_id: 2, classification_name: "Sport" },
      { classification_id: 3, classification_name: "SUV" },
      { classification_id: 4, classification_name: "Truck" },
      { classification_id: 5, classification_name: "Sedan" }
    ]
    data = { rows: mockClassifications }
  }
  
  let list = '<select name="classification_id" id="classificationList" required>'
  list += '<option value="">Choose a Classification</option>'
  
  data.rows.forEach((row) => {
    list += '<option value="' + row.classification_id + '"'
    if (row.classification_id == classification_id) {
      list += ' selected '
    }
    list += '>' + row.classification_name + '</option>'
  })
  
  list += '</select>'
  return list
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      })
  } else {
    next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util