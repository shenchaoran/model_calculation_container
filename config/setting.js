let os = require('os')
let fs = require('fs')
let path = require('path')

module.exports = {
    nodeName: "scr-ubuntu",
    port: 6868,
    auth: false,
    jwt_secret: 'asdl;fjl;asdjflasjkfsl;jfdl;asdfjl;asdjkflsda',
    API_prefix: '',
    platform: (function() {
        let platform = 1;
        if (os.type() == 'Linux') {
            platform = 2;
        }
        return platform;
    })(),
    portal: {
   	host: '192.168.1.131',
	port: '9999'
    },
    mongodb: {
        name: 'Comparison',
        host: '192.168.1.131',
        port: '27017'
    },
    geo_data: {
        path: path.join(__dirname, '../resources/geo-data'),
        max_size: 500000000
    },
    geo_models: {
        path: path.join(__dirname, '../resources/geo-models'),
        max_size: 500000000
    },
    debug: {
        child_process: true
    },
    invoke_failed_tag: '-----this is an error identification-----',
    progressReg: /-----Progress:(.*)%-----/,
    // 由 STD 转换重构过来的数据路径
    STD_DATA: {
        'IBIS_2.6b4': '/home/shencr/STD_DATA/IBIS_2.6b4',
        BIOME_BGC_STD_DATA: {
            inputPath: 'E:/Data/Biome_BGC_Data',
            outputPath: 'E:/Data/Biome_BGC_Data/outputs'
        }
    }
};
