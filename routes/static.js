const express = require('express');
const router = express.Router();
const path = require('path');

router.use(express.static("public"));
router.use("/css", express.static(path.join(__dirname, "../public/css")));
router.use("/js", express.static(path.join(__dirname, "../public/js")));
router.use("/images", express.static(path.join(__dirname, "../public/images")));

module.exports = router;