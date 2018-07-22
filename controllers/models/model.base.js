let Promise = require('bluebird')
let fs = Promise.promisifyAll(require('fs'))
let _ = require('lodash')
let uuidv1 = require('uuid/v1')
let exec = child_process.exec
let spawn = child_process.spawn
let calcuTaskDB = require('../../models/records.model')
let path = require('path')
let setting = require('../../config/setting')

module.exports = class ModelBase {
    static invokeAndDaemon() {
        let group = _.filter(this.cmdLine.split(/\s+/), str => str.trim() !== '');
        console.log(this.cmdLine);
        let updateRecord = (type, progress) => {
            if (progress) {
                msr.progress = progress;
                msr.state = progress >= 100 ? 'FINISHED_SUCCEED' : 'RUNNING';
            }
            else {
                msr.state = type === 'succeed' ? 'FINISHED_SUCCEED' : 'FINISHED_FAILED';
                msr.progress = type === 'succeed' ? 100 : -1;
            }

            calcuTaskDB.update({ _id: msr._id }, {
                $set: {
                    state: msr.state,
                    progress: msr.progress
                }
            });
        }
        // TODO 管道的写法，提取出进度条
        const cp = spawn(group[0], group.slice(1), {
            cwd: this.cwd
        });
        cp.stdout.on('data', data => {
            let str = data.toString();
            if (str.indexOf(setting.invoke_failed_tag) !== -1) {
                updateRecord('failed');
            }
            else {
                // 更新 process
                let group = str.match(setting.progressReg);
                let progress = group ? group[group.length - 1] : undefined;
                if (progress) {
                    console.log(progress);
                    updateRecord(undefined, parseFloat(progress));
                }
            }
        });
        cp.stderr.on('data', data => {
            // 
            console.log(data.toString());
            updateRecord('failed');
        });
        cp.on('close', code => {
            console.log(code);
            if (code === 0) {
                console.log('run finished!');
                updateRecord('succeed');
            }
            else {
                updateRecord('failed');
            }
        });
    }
}