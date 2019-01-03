const IBIS_26b4 = require('./IBIS-2.6b4')
const BIOME_BGC_site = require('./Biome-BGC-site')
const IBIS_site = require('./IBIS-site')
const BIOME_BGC_global = require('./Biome-BGC-global')
const IBIS_global = require('./IBIS-global')
const Bluebird = require('bluebird')
const calcuTaskDB = require('../../models/records.model')
const msDB = require('../../models/services.model')
const stdDataDB = require('../../models/std-data.model')

module.exports = async function(calcuTask) {
    try {
        let ms = await msDB.findOne({_id: calcuTask.msId})
        switch (ms.MDL.meta.name) {
            case 'IBIS_2.6b4':
                return new IBIS_26b4(calcuTask, ms)
            case 'IBIS site':
                return new IBIS_site(calcuTask, ms)
            case 'Biome-BGC site':
                return new BIOME_BGC_site(calcuTask, ms)
            case 'Biome-BGC global':
                return new BIOME_BGC_global(calcuTask, ms)
            case 'IBIS global':
                return new IBIS_global(calcuTask, ms)
        }
    }
    catch(e) {
        console.log(e);
        return Bluebird.reject(e);
    }
}