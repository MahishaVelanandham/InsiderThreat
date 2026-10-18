const express = require('express');
const r = express.Router();
const { login } = require('../controllers/authController');
r.post('/login', login);
module.exports = r;
