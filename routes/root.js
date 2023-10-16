const express = require('express');
const router = express.Router();
const path = require('path');

// define routes in the root directory
router.get('^/$|/index(.html)?', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

module.exports = router;