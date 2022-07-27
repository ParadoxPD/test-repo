const express = require('express');
const router = express.Router();

const exercise = require('./exercise');

router.use('/users', exercise);

module.exports = router;