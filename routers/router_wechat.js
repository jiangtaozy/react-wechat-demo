/**
 * Created by Jemo on 17-11-2.
 * 用户消息和开发者需要的事件推送，将会被转发到该路由
 */

const express = require('express');
const router = express.Router();

const controllerWechat = require('../controller/controller_wechat');
router.all('/wechat', controllerWechat);

module.exports = router;
