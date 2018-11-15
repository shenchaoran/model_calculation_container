/**
 * Created by SCR on 2017/6/29.
 */
let express = require('express')
let DataCtrl = require('../controllers/data.controller');
let formidable = require('formidable');
let setting = require('../config/setting');
let router = express.Router();
let db = require('../models/data.model');
module.exports = router;

/**
 * {code, _id}
 */
router.route('/')
    .post((req, res, next) => {
        let form = new formidable.IncomingForm();
        form.encoding = 'utf-8';
        form.uploadDir = setting.geo_data.path;
        form.keepExtensions = true;
        form.maxFieldsSize = setting.geo_data.max_size;
        form.parse(req, (err, fields, files) => {
            if (err) {
                return next(err);
            } else {
                DataCtrl.insert(fields, files)
                    .then(rst => {
                        return res.json(rst);
                    })
                    .catch(next);
            }
        });
    });

router.route('/download')
    .get((req, res, next) => {
        try {
            if (req.query.msrId && req.query.eventId) {
                DataCtrl.downloadByMSR(req.query.msrId, req.query.eventId)
                    .then(({
                        stream,
                        fname
                    }) => {
                        res.set({
                            'Content-Type': 'file/*',
                            'Content-Disposition': 'attachment;filename=' +
                                fname
                        });
                        stream.on('error', next)
                        return stream.pipe(res)   
                    })
                    .catch(e => {
                        return next(e)
                    })
            } else {
                return res.json({
                    code: 400,
                    desc: 'invalid request query parameters'
                })
            }
        } catch (e) {
            console.log(e)
            return next(e)
        }
    })

/**
 * file
 */
router.route('/:id')
    .get((req, res, next) => {
        DataCtrl.downloadById(req.params.id)
            .then(msg => {
                return res.download(msg.path, msg.fname);
            });
    });