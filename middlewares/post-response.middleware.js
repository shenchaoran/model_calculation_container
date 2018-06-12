module.exports = app => {
    app.use((req, res, next) => {
        let err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    app.use((err, req, res, next) => {
        console.log(err);
        let error = {
            code: err.status || 500,
            desc: err.message,
            stack: req.app.get('env') === 'development' ? err.stack : {}
        };
        return res.json(error);
    });
};