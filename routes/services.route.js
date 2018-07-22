let express = require('express');
let BaseRoute = require('./base.route')
let db = require('../models/services.model');
let msCtrl = new require('../controllers/services.controller')()

const defaultRoutes = [
    'findAll',
    'find'
];
const router = express.Router();
module.exports = router;

/**
 * return { code }
 * 
 * req.body: calcuTask {
 *      ...
 *      ms
 * }
 */
router.route('/:id/invoke')
    .post((req, res, next) => {
        if(req.body.calcuTask) {
            msCtrl.invoke(req.body.calcuTask)
                .then(msg => {
                    return res.json(msg)
                })
                .catch(next)
        }
    });

BaseRoute(router, db, defaultRoutes);