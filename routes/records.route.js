let express = require('express');
let BaseRoute = require('./base.route')
let db = require('../models/records.model');

const defaultRoutes = [
    'findAll',
    'insert',
    'find'
];
const router = express.Router();
module.exports = router;

BaseRoute(router, db, defaultRoutes);