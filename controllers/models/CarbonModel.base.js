let ModelBase = require('./model.base')

module.exports = class CarbonModelBase extends ModelBase {
    static statEXE(doc) {}

    /**
     * 调用模型，
     * 并更新模型运行进度，直接操作数据库
     *
     * @static
     * @memberof ModelBase
     */
    static invoke() {}
}