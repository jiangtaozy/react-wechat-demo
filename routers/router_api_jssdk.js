/*
 * Created by jemo on 2017-12-28.
 * 微信JSSDK配置信息路由
 */

const express = require('express');
const router = express.Router();

const controllerApiJSSDK = require('../controller/controller_api_jssdk');
router.get('/api/jssdk', controllerApiJSSDK.get);

module.exports = router;
