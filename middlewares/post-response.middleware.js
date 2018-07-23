module.exports = app => {
    app.use((req, res, next) => {
        let err = new Error('Not Found');
        err.code = 404;
        next(err);
    });

    app.use((err, req, res, next) => {
        console.log(err);
        let error = err instanceof String? {
            code: 500,
            desc: err
        }: {
            code: err.code || 500,
            desc: err.message,
            stack: req.app.get('env') === 'development' ? err.stack : {}
        };
        return res.json(error);
    });
};