let express = require('express');
let BaseRoute = require('./base.route')
let db = require('../models/services.model');

const defaultRoutes = [
    'findAll',
    'insert',
    'find',
    'remove'
];
const router = express.Router();
module.exports = router;

router.route('/:id')
    .get((req, res, next) => {
        DataCtrl.download(req.params.id)
            .then(rst => {
                res.set({
                    'Content-Type': 'file/*',
                    'Content-Length': rst.length,
                    'Content-Disposition': 'attachment;filename=' +
                        encodeURIComponent(rst.filename)
                });
                return res.end(rst.data);
            });
    });

BaseRoute(router, db, defaultRoutes);