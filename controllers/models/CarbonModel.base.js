let ModelBase = require('./model.base')

module.exports = class CarbonModelBase extends ModelBase {
    constructor() {
        super()
    }
    statEXE() {}

    /**
     * 调用模型，
     * 并更新模型运行进度，直接操作数据库
     *
     * @memberof ModelBase
     */
    invoke() {}
}