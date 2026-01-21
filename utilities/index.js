const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
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
  
  let list = '<ul class="nav-menu">'
  list += '<li><a href="/" title="Home page">Home</a></li>'
  
  data.rows.forEach((row) => {
    list += '<li>'
    list += '<a href="/inv/type/' + row.classification_id + 
            '" title="See our inventory of ' + row.classification_name + 
            ' vehicles">' + row.classification_name + '</a>'
    list += '</li>'
  })
  
  list += '</ul>'
  return list
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

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util