/*
 * Created by jemo on 2018-6-20.
 * 用户路由
 */

const express = require('express');
const router = express.Router();
const userController = require('../controller/controller_api_user');
const sendVcode = require('../middleware/sms/middleware_sms_send_captcha');
const checkVcode = require('../middleware/sms/middleware_sms_check_captcha');

router.get('/api/user', userController.get);
router.post('/api/code', sendVcode);
router.post('/api/bind', checkVcode, userController.bind);

module.exports = router;
