const config = require('./config')
const helpers = require('./helpers')
const tokenHandler = require('./tokenshandler')
const _data = require('./data')

let checksHandler = {}

checksHandler.checks = (data, callback) => {

    const acceptableMethods = ['post', 'get', 'put', 'delete']

    if (acceptableMethods.indexOf(data.method) > -1) {

        checksHandler._checks[data.method](data, callback)

    } else{

        callback(405)
    }
}


checksHandler._checks = {}


checksHandler._checks.get = (data, callback) => {

    const checkId = String(data.queryStringObject.checkId)

    if (checkId && checkId.length === 20) {

        _data.read('checks', checkId, (err, checksData) => {

            if (!err && checksData) {

                const token = String(data.headers.token)

                tokenHandler._tokens.verifyToken(token, checksData.phoneNumber, (isValidToken) => {

                    if (isValidToken) {

                        callback(200, checksData)
        
                    } else {
        
                        callback(403, {error: "Unauthorized"})
                    } 
                })

            }

        })
    }
}


checksHandler._checks.post = (data, callback) => {

    const protocol = String(data.payload.protocol) && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol.trim() : false

    const url = String(data.payload.url) && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false 

    const method = String(data.payload.method) && ['get', 'post', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method.trim() : false

    const successCodes = Object(data.payload.successCodes) && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false

    const timeoutSeconds = Number(data.payload.timeoutSeconds) && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5  ? data.payload.timeoutSeconds : false 

    if (protocol && method && url && timeoutSeconds && successCodes) {

        const token = String(data.headers.token)

        _data.read('tokens', token, (err, tokenData) => {

            if (!err && tokenData) {

                const phoneNumber = tokenData.phoneNumber

                _data.read('users', phoneNumber, (err, userData) => {

                    if (!err && userData) {
        
                        const userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : []
        
                        if (userChecks.length < config.maxChecksLimit) {

                            const checkId = helpers.createRandomString(20)

                            const checkObject = {
                                checkId, 
                                phoneNumber, 
                                protocol,
                                url,
                                method,
                                successCodes,
                                timeoutSeconds
                            }

                            _data.create('checks', checkId, checkObject, (err) => {

                                if (!err) {

                                    userData.checks = userChecks

                                    userData.checks.push(checkId)

                                    _data.update('users', phoneNumber, userData, (err) => {

                                        if (!err) {

                                            callback(200, checkObject)

                                        } else {

                                            callback(500, {error: 'Failed updating users'})
                                        }

                                    })

                                } else {

                                    callback(500, {error: 'Failed creating checks'})
                                }
                            })

                        } else {

                            callback(400, {error: 'Max checks reached'})
                        }
        
                    } else {
        
                        callback(403, {error: 'Unauthorized'})
                    }
        
                })

            } else {

                callback(403, {error: 'Unauthorized'})
            }

        })

    } else {

        callback(400, {error: "Missing required input or invalid inputs"})
    }
    
}


checksHandler._checks.put = (data, callback) => {
    
    const protocol = String(data.payload.protocol) && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol.trim() : false

    const url = String(data.payload.url) && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false 

    const method = String(data.payload.method) && ['get', 'post', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method.trim() : false

    const successCodes = Object(data.payload.successCodes) && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false

    const timeoutSeconds = Number(data.payload.timeoutSeconds) && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5  ? data.payload.timeoutSeconds : false 

    const checkId = String(data.payload.checkId)

    if (checkId && checkId.length === 20) {

        if (protocol || method || url || timeoutSeconds || successCodes) {

            _data.read('checks', checkId, (err, checkData) => {

                if (!err && checkData) {

                    const token = String(data.headers.token)

                    tokenHandler._tokens.verifyToken(token, checkData.phoneNumber, (isValidToken) => {
    
                        if (isValidToken) {

                            const checkDataObject = {
                                successCodes: successCodes ? successCodes : checkData.successCodes,
                                timeoutSeconds: timeoutSeconds ? timeoutSeconds : checkData.timeoutSeconds,
                                method: method ? method : checkData.method,
                                url: url ? url : checkData.url,
                                protocol: protocol ? protocol : checkData.protocol,
                                phoneNumber: checkData.phoneNumber,
                                checkId: checkId
                            }

                            _data.update('checks', checkId, checkDataObject, (err) => {

                                if (!err) {

                                    callback(200)

                                } else {

                                    callback(500, {error: 'Failed updating the check'})
                                }

                            })


                        } else {

                            callback(403, {error: 'Unauthorized'})
                        }

                    })

                } else {

                    callback(400, {error: 'Check Id does not exist'})

                }
            })

        } else {

            callback (422, {error: 'Missing fields required'})
        }

    } else {

        callback (422, {error: 'Checks ID is required'})
    }
    
}


checksHandler._checks.delete = (data, callback) => {
 
    const checkId = String(data.queryStringObject.checkId)

    if (checkId && checkId.length === 20) {

        _data.read('checks', checkId, (err, checkData) => {

            if (!err && checkData) {

                const token = String(data.headers.token) 

                tokenHandler._tokens.verifyToken(token, checkData.phoneNumber, (isValidToken) => {

                    if (isValidToken) {

                        _data.delete('checks', checkId, (err) => {

                            if (!err) {

                                _data.read('users', checkData.phoneNumber, (err, userData) => {

                                    if (!err && userData) {

                                        const userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : []

                                        const checkPosition = userChecks.indexOf(checkId)

                                        if (checkPosition > -1) {

                                            userChecks.splice(checkPosition, 1)

                                            _data.update('users', userData.phoneNumber, userData, (err) => {
                
                                                if (!err) {
                    
                                                    callback(200)

                                                }else {

                                                    callback(500, {error: 'Could not delete the specified user'})
                                                }
                                            })

                                        } else {

                                            callback(500, {error: 'No checks for user'})
                                        }

                                    } else {
                
                                        callback(500, {error: 'Could not find the checks owner'})
                                    }
                                })

                            }else {
                                callback(500, {error: 'Could not delete the specified check'})
                            }
                        })
                        
                    } else {

                        callback(403, {error: "Unauthorized"})
                    }
                })
            } else {

                callback(400, {error: 'Specified check not found'})
            }
        })

    } else {

        callback(400, {error: 'Check Id is required'})
    }
}


checksHandler.checkList = () => {

}


checksHandler.checkCreate = () => {

}


checksHandler.checkEdit = () => {

}

module.exports = checksHandler