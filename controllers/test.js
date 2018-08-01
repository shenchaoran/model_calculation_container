let path = require('path')
let Promise = require('bluebird')
let fs = Promise.promisifyAll(require('fs'))
let RequestUtil = require('../utils/request.utils')

new Promise((resolve, reject) => {
    Promise.resolve(1)
        .then(v => {
            throw v
        })
        .then(v => {
            console.log('in then:', v)
        }) 
        .catch(v => {
            console.log('in catch:', v)
        })
});

// class Base {
//     constructor(a) {
//         this.a = a
//     }

//     test() {
//         console.log('base test')
//     }
// }

// class A extends Base {
//     constructor(a) {
//         super(a)
//     }

//     test() {
//         super.test()
//         console.log('A test')
//     }
// }

// let ins = new A()
// ins.test()

// let ws = fs.createWriteStream(path.join(__dirname, '../test/writeSteam.test.txt'))
// let rs1 = fs.createReadStream(path.join(__dirname, '../README.md'))
// let rs2 = fs.createReadStream(path.join(__dirname, '../package.json'))
// rs1.pipe(ws)
// rs2.pipe(ws)

// RequestUtil.postByServer('http://localhost:9999/nodes/login', {
//     nodeName: 'scr-windows',
//     password: 'scr1994'
// }, 'JSON')
//     .then(res => {
//         console.log(res)
//     })

// RequestUtil.getByServer('http://localhost:9999/index')

// fs.readFileAsync('asdf', 'utf-8')
//     .then(buf => {
//         buf
//     })
//     .catch(e => {
//         e
//     })

// fs.statAsync('/asdf')
//     .then(stats => {
//         stats
//     })
//     .catch(e => {
//         e
//     })