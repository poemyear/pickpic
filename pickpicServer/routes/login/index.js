var express = require('express');
var router = express.Router();
const controller = require('./controller');

router.get('/NaverLoginURL', controller.getNaverLoginUri);
router.get('/NaverLogin', controller.naverLogin);
router.post('/', controller.login);

module.exports = router;
