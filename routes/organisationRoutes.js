const express = require('express');
const { createOrganisation } = require('../controllers/organisationController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authenticate, createOrganisation);

module.exports = router;
