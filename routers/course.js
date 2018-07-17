/*
 * Created by jemo on 2018-6-19.
 * 课程路由
 */

const express = require('express');
const router = express.Router();
const courseController = require('../controller/course');

router.get('/api/course', courseController.list);
router.get('/api/course/:id', courseController.detail);

module.exports = router;
