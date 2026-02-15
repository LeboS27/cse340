const session = require("express-session");
const pool = require('./database/');
const express = require('express');
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute"); 
const utilities = require("./utilities/");
const app = express();
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")


app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cookieParser())

// Set up static files
app.use(express.static('public'));


/* ***********************
 * Middleware
 * ************************/
// Session middleware first
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Flash messages
app.use(require('connect-flash')())

// Parse cookies and body
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Check JWT token
app.use(utilities.checkJWTToken)

// Express Messages Middleware
app.use(function(req, res, next){
  res.locals.messages = {
    error: req.flash('error'),
    success: req.flash('success'),
    info: req.flash('info'),
    notice: req.flash('notice')
  }
  next()
})
app.use(utilities.checkJWTToken)

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// Set up EJS and layouts
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/layout');

// Routes
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute); 

// Test route
app.get("/test-nav", async (req, res) => {
  let nav = await utilities.getNav(req, res, () => {})
  res.send(nav)
})

// Home route
app.get("/", utilities.handleErrors(baseController.buildHome));

app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'});
});


// Debug route to test getNav
app.get("/test-nav", async (req, res) => {
  try {
    const nav = await utilities.getNav(req, res, () => {})
    res.send(`<h1>Nav Test</h1><div>${nav}</div>`)
  } catch (error) {
    res.status(500).send(`Error: ${error.message}<br>Stack: ${error.stack}`)
  }
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  // Initialize res.locals if not set
  if (!res.locals) {
    res.locals = {}
  }
  
  // Also ensure res.locals.loggedin is defined
  if (res.locals.loggedin === undefined) {
    res.locals.loggedin = false
  }
  
  let nav
  try {
    nav = await utilities.getNav(req, res, next)
  } catch (navError) {
    console.error('Error getting nav in error handler:', navError)
    nav = '<ul class="nav-menu"><li><a href="/" title="Home page">Home</a></li><li><a href="/account/login" title="Login to your account">My Account</a></li></ul>'
  }
  
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  
  let message
  if(err.status == 404){ 
    message = err.message
  } else {
    message = 'Oh no! There was a crash. Maybe try a different route?'
  }
  
  res.status(err.status || 500).render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

// Debug route to test getNav
app.get("/test-nav", async (req, res) => {
  try {
    const nav = await utilities.getNav(req, res, () => {})
    res.send(`<h1>Nav Test</h1><div>${nav}</div>`)
  } catch (error) {
    res.status(500).send(`Error: ${error.message}<br>Stack: ${error.stack}`)
  }
})

// Debug route to test classification list
app.get("/test-classification-list", async (req, res) => {
  try {
    const list = await utilities.buildClassificationList()
    res.send(`<h1>Classification List Test</h1><div>${list}</div>`)
  } catch (error) {
    res.status(500).send(`Error: ${error.message}<br>Stack: ${error.stack}`)
  }
})

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

