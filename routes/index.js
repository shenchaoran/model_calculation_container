let express = require('express');
let router = express.Router();
module.exports = router;

let servicesRoute = require('./services.route');

router.use('/services', servicesRoute);


router.route('/index')
    .get((req, res, next) => {
        return res.json({
            code: 200,
            data: 'ping succeed'
        });
    });

router.route('*')
    .get((req, res, next) => {
        return res.json({
            code: 404
        });
    });