/**
 * A library for storing and rotating logs
 * 
 */

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')


let lib = {}

lib.baseDir = path.join(__dirname,'../.logs/')

lib.append = (file, str, callback) => {
    fs.open(`${lib.baseDir}${file}.log`, 'a', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            fs.appendFile(fileDescriptor, `${str}\n`, (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(false)
                        } else {
                            callback('Error closing file that was being appended')
                        }
                    })
                } else {
                    callback('Error appending to file')
                }
            })
        } else {
            callback('Could not open file for appending')
        }
    })
}


module.exports = lib