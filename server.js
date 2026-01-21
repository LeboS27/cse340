const express = require('express');
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities");
const app = express();
const expressLayouts = require('express-ejs-layouts');
const path = require('path')

app.use(express.static(path.join(__dirname, 'public')))

// Set up static files
app.use(express.static('public'));

// Set up EJS and layouts
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/layout');

// Routes
app.use("/inv", inventoryRoute);

// Home route - only define once
app.get("/", utilities.handleErrors(baseController.buildHome));

app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'});
});

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  
  let message;
  if(err.status == 404){ 
    message = err.message;
  } else {
    message = 'Oh no! There was a crash. Maybe try a different route?';
  }
  
  res.status(err.status || 500).render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  });
});



// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});