const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');

router.post('/createOrUpdate', UserController.createOrUpdate);
router.get('/getListByPagination', UserController.getListByPagination);
router.get('/userInfo', UserController.userInfo);
router.get('/login', UserController.login);
router.post('/register', UserController.register);
router.post('/logout', UserController.logout);

module.exports = router;
