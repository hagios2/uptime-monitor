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
        
                        const userChecks = Object(userData.userChecks) && userData.userChecks instanceof Array ? userData.userChecks : []
        
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


checksHandler._checks.put = () => {
    
}


checksHandler._checks.delete = () => {
    
}


module.exports = checksHandler