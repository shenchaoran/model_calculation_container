const Bluebird = require('bluebird'),
    fs = Bluebird.promisifyAll(require('fs')),
    path = require('path')

const ptA = 1,
    ptZ = 1,
    fp = 'E:\\Data\\Biome_BGC_Data\\5b9012e4c29ca433443dcfab\\ini';

let arr = Array(ptZ).fill(0).map((v, i) => i + 1)
Bluebird.map(arr, i => {
    let str = fs.readFileAsync(path.join(path, `${i}.ini`))
    // str.replace();
}, {
    concurrency: 100
})