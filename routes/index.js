let express = require('express');
let router = express.Router();
module.exports = router;

let servicesRoute = require('./services.route');
let recordsRoute = require('./records.route');
let dataRoute = require('./data.route');

router.use('/services', servicesRoute);
router.use('/records', recordsRoute);
router.use('/data', dataRoute);

router.route('/')
    .get((req, res, next) => {
        return res.redirect('/index');
    });

router.route('/index')
    .get((req, res, next) => {
        return res.json({
            code: 200,
            data: 'model calculation container'
        });
    });

router.route('*')
    .get((req, res, next) => {
        return res.json({
            code: 404
        });
    });