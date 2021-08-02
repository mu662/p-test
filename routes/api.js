var express = require('express');
var router = express.Router();
var cors = require('cors')
var authController = require('../controllers/authController');

router.post('/register',cors(), authController.register);
router.post('/login',cors(), authController.login);
router.get('/list',cors(), authController.usersList);

module.exports = router