/**
 * Created by Jemo on 17-11-24.
 */

const express = require('express');
const router = express.Router();

const controllerCreateMenu = require('../controller/controller_create_menu');
router.use('/createmenu', controllerCreateMenu);

module.exports = router;