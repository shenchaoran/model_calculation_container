const IBIS_26b4 = require('./IBIS_2.6b4')
const BIOME_BGC_site = require('./BIOME-BGC_site')
const IBIS_site = require('./IBIS_site')
const Bluebird = require('bluebird')
const calcuTaskDB = require('../../models/records.model')
const msDB = require('../../models/services.model')
const stdDataDB = require('../../models/std-data.model')

module.exports = async function(calcuTask) {
    try {
        let [ms, std] = await Bluebird.all([
            msDB.findOne({_id: calcuTask.msId}),
            stdDataDB.findOne({_id: calcuTask.stdId}),
        ])
        switch (ms.MDL.meta.name) {
            case 'IBIS_2.6b4':
                return new IBIS_26b4(calcuTask, ms, std)
            case 'IBIS site':
                return new IBIS_site(calcuTask, ms, std)
            case 'BIOME-BGC site':
                return new BIOME_BGC_site(calcuTask, ms, std)
        }
    }
    catch(e) {
        console.log(e);
        return Bluebird.reject(e);
    }
}