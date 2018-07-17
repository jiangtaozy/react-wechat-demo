/*
 * Created by jemo on 2018-6-14.
 * 商品路由
 */

const express = require('express');
const router = express.Router();
const itemController = require('../controller/item');

router.get('/api/item', itemController.list);
router.get('/api/item/:id', itemController.detail);

module.exports = router;
