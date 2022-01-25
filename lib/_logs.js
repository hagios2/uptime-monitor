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

lib.list = (includeCompressedLogs, callback) => {
    fs.readdir(lib.baseDir, () => {
        if (!err && data && data.length > 0) {
            const trimmedFileNames = []

            data.forEeach((fileName) => {
                //add the .log files
                if (fileName.indexOf('.log') > -1) {
                    trimmedFileNames.push(fileName.replace('.log', ''))
                }

                //Add on the .gz files
                if (fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
                    trimmedFileNames.push(fileName.replace('.gz.b64', ''))
                }
            })
            callback(false, trimmedFileNames)
        } else {
            callback(err, data)
        }
    })
}

//compress the contents of one .log file in to a .gz.b64 file within the same directory
lib.compress = (logId, newFileId, callback) => {
    const sourceFile = `${logId}.log`

    const destFile = `${newFileId}.gz.b64`

    fs.readFile(`${lib.baseDir}${sourceFile}`, 'utf8', (err, inputString) => {
        if (!err && inputString) {
            zlib.gzip(inputString, (err, buffer) => {
                if (!err && buffer) {
                    //send file to the destfile
                    fs.open(`${lib.baseDir}${destFile}`, 'wx', (err, fileDescriptor) => {
                        if (!err && fileDescriptor) {
                            fs.writeFile(fileDescriptor, buffer.toString('base64'), (err) => {
                                if (!err) {
                                    fs.close(fileDescriptor, (err) => {
                                        if (!err) {
                                            callback(false)
                                        } else {
                                            callback(err)
                                        }
                                    })
                                } else {
                                    callback(err)
                                }
                            })
                        } else {
                            callback(err)
                        }
                    })
                } else {
                    callback(err)
                }
            })
        } else {
            callback(err)
        }
    })
}

//decompress the contents of a gz.b64 fille into a string variable
lib.decompress = (fileId, callback) => {
    const fileName = `${fileId}.gz.b64`

    fs.readFile(`${lib.baseDir}${fileName}`, 'utf8', (err, str) => {
        if (!err && str) {
            const inputBuffer = buffer.from(str, 'base64')

            zlib.unzip(inputBuffer, (err, outputBuffer) => {
                if (!err && outputBuffer) {
                    const str = outputBuffer.toString()

                    callback(err, str)
                } else {
                    callback(err)
                }
            })
        } else {
            callback(err)
        }
    })
}


lib.truncate = (logId, callback) => {
    fs.truncate(`${lib.baseDir}${logId}.log`, 0, (err) => {
        if (!err) {
            callback(false)
        } else {
            callback(err)
        }
    })
}

module.exports = lib