const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');

// Set up static files
app.use(express.static('public'));

// Set up EJS and layouts
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/layout');

// Routes
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Home | CSE Motors',
        currentUrl: '/'
    });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});